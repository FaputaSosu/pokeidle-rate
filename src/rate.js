(function (root) {
  'use strict';

  const TABELA_TIPOS = {
    NORMAL: { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
    FIRE: { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
    WATER: { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
    GRASS: { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
    ELECTRIC: { WATER: 2, GRASS: 0.5, ELECTRIC: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
    ICE: { FIRE: 0.5, WATER: 0.5, GRASS: 2, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
    FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5 },
    POISON: { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2 },
    GROUND: { FIRE: 2, GRASS: 0.5, ELECTRIC: 2, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
    FLYING: { GRASS: 2, ELECTRIC: 0.5, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
    PSYCHIC: { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
    BUG: { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, STEEL: 0.5, FAIRY: 0.5 },
    ROCK: { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
    GHOST: { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
    DRAGON: { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
    STEEL: { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5, FAIRY: 2 },
    FAIRY: { FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5 },
    DARK: { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 }
  };

  const TODOS_TIPOS = Object.keys(TABELA_TIPOS);

  function calcularEfetividadeAtacante(tipoAtaque, tipoDef1, tipoDef2) {
    if (!tipoAtaque) return 1;
    const t = tipoAtaque.toUpperCase();
    const d1 = tipoDef1 ? tipoDef1.toUpperCase() : '';
    const d2 = tipoDef2 ? tipoDef2.toUpperCase() : '';

    let m1 = 1, m2 = 1;
    if (TABELA_TIPOS[t]) {
      if (d1 && TABELA_TIPOS[t][d1] !== undefined) m1 = TABELA_TIPOS[t][d1];
      if (d2 && TABELA_TIPOS[t][d2] !== undefined) m2 = TABELA_TIPOS[t][d2];
    }
    return m1 * m2;
  }

  function analisarPerfilOfensivo(tiposEspecie) {
    const eficientes = [];
    const desfavoraveis = [];
    const neutros = [];

    TODOS_TIPOS.forEach(tipoAlvo => {
      let maxMult = 0;
      tiposEspecie.forEach(tpEsp => {
        const m = calcularEfetividadeAtacante(tpEsp, tipoAlvo, '');
        if (m > maxMult) maxMult = m;
      });

      if (maxMult > 1) eficientes.push({ tipo: tipoAlvo, mult: maxMult });
      else if (maxMult === 1) neutros.push({ tipo: tipoAlvo, mult: 1 });
      else desfavoraveis.push({ tipo: tipoAlvo, mult: maxMult });
    });

    return { eficientes, desfavoraveis, neutros };
  }

  function analisarPerfilDefensivo(tipo1, tipo2) {
    const resistencias = [];

    TODOS_TIPOS.forEach(tipoAtacante => {
      let mult = 1;
      if (TABELA_TIPOS[tipoAtacante]) {
        let m1 = TABELA_TIPOS[tipoAtacante][tipo1 ? tipo1.toUpperCase() : ''] ?? 1;
        let m2 = tipo2 ? (TABELA_TIPOS[tipoAtacante][tipo2.toUpperCase()] ?? 1) : 1;
        mult = m1 * m2;
      }

      if (mult < 1) resistencias.push({ tipo: tipoAtacante, mult });
    });

    return resistencias;
  }

  function injetarBotao() {
    const acoes = document.querySelector('.fi-acoes');
    if (!acoes) return;
    if (document.querySelector('#btn-rate-poke')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-rate-poke';
    btn.type = 'button';
    btn.className = 'pir-btn-rate';
    btn.innerHTML = '<span class="pir-tag">/rate</span> Analisar Status';

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      executarRate();
    };

    acoes.appendChild(btn);
  }

  setInterval(injetarBotao, 400);

  function fecharPainel() {
    const painelExistente = document.querySelector('#pir-painel-resumo');
    if (painelExistente) painelExistente.remove();
  }

  function mostrarModalResumo(dados) {
    fecharPainel();

    const painel = document.createElement('div');
    painel.id = 'pir-painel-resumo';
    painel.className = 'pir-painel';

    const statsHTML = Object.entries(dados.eficienciaStats).map(([stat, info]) => `
      <div class="pir-stat-item" style="margin-bottom: 5px;">
        <div class="pir-stat-info" style="font-size: 11px;">
          <span>${stat.toUpperCase()} (IV ${info.iv}/32)</span>
          <span style="color: ${info.pct >= 75 ? '#6fd08a' : info.pct >= 45 ? '#ffe9a8' : '#ffc9bd'};">${info.pct}%</span>
        </div>
        <div class="pir-stat-bar" style="height: 5px;">
          <div class="pir-stat-fill" style="width: ${info.pct}%;"></div>
        </div>
      </div>
    `).join('');

    const renderPilulas = (lista) => {
      if (!lista.length) return '<span style="color: #777; font-size: 11px;">Nenhum</span>';
      return lista.map(item => `
        <span class="tipo ${item.tipo}" style="font-size: 10px; padding: 2px 6px; margin: 2px; display: inline-block; font-weight: 600; border-radius: 4px;">
          ${item.tipo} (${item.mult}x)
        </span>
      `).join('');
    };

    const ofensivo = dados.perfilOfensivo;
    const defensivo = dados.perfilDefensivo;

    let corNota = '#f59e0b';
    let corTextoNota = '#15131a';
    if (dados.veredito.classe === 'otima') { corNota = '#c084fc'; }
    else if (dados.veredito.classe === 'mediano') { corNota = '#38bdf8'; }
    else if (dados.veredito.classe === 'ruim') { corNota = '#4ade80'; }
    else if (dados.veredito.classe === 'horrivel') { corNota = '#94a3b8'; }

    painel.innerHTML = `
      <div class="pir-cab">
        <div class="pir-titulo" style="display: flex; flex-direction: column; gap: 4px; padding-right: 12px;">
          <h3>/rate — Visão Geral & Eficiência</h3>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px;">
            <small style="color: #f5cdb9; font-size: 11.5px; font-weight: 600;">
              ${dados.nome} (Nv ${dados.nivel}) | Tipos: <b>${dados.tipos.join(' / ')}</b> | Potência: <b>${dados.potencia}</b> | Qualidade: <b>${dados.qualidade}</b>
            </small>
            <span style="background: ${corNota}; color: ${corTextoNota}; padding: 2px 8px; border-radius: 4px; font-weight: 900; font-size: 11px; box-shadow: 0 1px 4px rgba(0,0,0,0.5); white-space: nowrap;">
              NOTA GERAL: ${dados.veredito.tituloNota} (${dados.veredito.notaReal}%)
            </span>
          </div>
        </div>
        <button class="pir-fechar" id="pir-btn-fechar">×</button>
      </div>

      <div class="pir-corpo">
        <div class="pir-secao-tit">Veredito Resumido da Build</div>
        <div class="pir-caixa">
          <div class="pir-veredito-box ${dados.veredito.classe}">
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 6px; color: #ffe9a8;">
              ${dados.veredito.resumoCabecalho}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(0,0,0,0.25); padding: 8px; border-radius: 6px;">
              <div>
                <div style="font-size: 11px; font-weight: 800; color: #ffe9a8; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px; display: flex; justify-content: space-between;">
                  <span>EFICIÊNCIA DE ATAQUE</span>
                  <span>${dados.veredito.eficienciaAtaque}%</span>
                </div>
                <div style="font-size: 11.5px; color: #fff6ef; line-height: 1.35;">
                  ${dados.veredito.analiseOfensiva}
                </div>
              </div>

              <div>
                <div style="font-size: 11px; font-weight: 800; color: #6fd08a; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px; display: flex; justify-content: space-between;">
                  <span>EFICIÊNCIA DE DEFESA</span>
                  <span>${dados.veredito.eficienciaDefesa}%</span>
                </div>
                <div style="font-size: 11.5px; color: #fff6ef; line-height: 1.35;">
                  ${dados.veredito.analiseDefensiva}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pir-secao-tit">Eficiência dos Status & Vantagens Elementais</div>
        <div class="pir-caixa" style="display: grid; grid-template-columns: 240px 1fr; gap: 12px; align-items: stretch;">
          <div style="background: rgba(0,0,0,0.15); padding: 8px; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 6px; color: #eee;">Status & IVs</div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${statsHTML}
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; font-size: 11px; display: flex; flex-direction: column; justify-content: space-between; gap: 6px;">
            <div>
              <div style="font-weight: 700; color: #6fd08a; margin-bottom: 3px;">Ataques (O que esta espécie tem vantagem)</div>
              <div style="margin-bottom: 6px; line-height: 1.5;">${renderPilulas(ofensivo.eficientes)}</div>
              
              <div style="font-weight: 700; color: #ffc9bd; margin-bottom: 3px;">Defesas (O que resistem a esta espécie)</div>
              <div style="margin-bottom: 6px; line-height: 1.5;">${renderPilulas(defensivo)}</div>

              <div style="font-weight: 700; color: #ffe9a8; margin-bottom: 3px;">Neutros (Sem vantagem ou desvantagem)</div>
              <div style="line-height: 1.5;">${renderPilulas(ofensivo.neutros)}</div>
            </div>
          </div>
        </div>

        <div class="pir-secao-tit" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Simulador de Dano Elemental por Alvo</span>
          <div style="font-size: 12px; font-weight: normal; display: flex; align-items: center; gap: 6px;">
            <label for="pir-dropdown-alvo">Alvo Defensor:</label>
            <div id="pir-dropdown-container" style="position: relative; display: inline-block;">
              <button id="pir-dropdown-btn" type="button" style="background: #33202b; color: #fff6ef; border: 1px solid #480e1e; padding: 4px 10px; border-radius: 4px; font-size: 11.5px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600;">
                <span id="pir-dropdown-selecionado">-- SEM ALVO --</span>
                <span style="font-size: 9px; color: #f5cdb9;">▼</span>
              </button>
              <div id="pir-dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: #2a1922; border: 1px solid #480e1e; border-radius: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.8); z-index: 999999; padding: 6px; width: 220px; max-height: 220px; overflow-y: auto;">
                <div class="pir-opcao-tipo" data-valor="" style="padding: 5px 8px; cursor: pointer; border-radius: 4px; font-size: 11px; color: #ccc; margin-bottom: 4px; font-weight: 600; border: 1px solid #480e1e; background: #33202b; text-align: center;">-- SEM ALVO --</div>
                <div id="pir-lista-tipos-custom" style="display: flex; flex-wrap: wrap; gap: 4px;"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="pir-caixa pir-tabela-wrap">
          <table class="pir-tabela">
            <thead>
              <tr>
                <th>Golpe</th>
                <th>Tipo</th>
                <th>Cat.</th>
                <th>Poder</th>
                <th>CD (Mín / Atual / Máx)</th>
                <th>Dano Base</th>
                <th>Dano vs Alvo</th>
              </tr>
            </thead>
            <tbody id="pir-tbody-golpes">
              <!-- Preenchido dinamicamente -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(painel);
    document.querySelector('#pir-btn-fechar').onclick = fecharPainel;

    let tipoAlvoAtual = '';
    const btnDropdown = document.getElementById('pir-dropdown-btn');
    const menuDropdown = document.getElementById('pir-dropdown-menu');
    const spanSelecionado = document.getElementById('pir-dropdown-selecionado');
    const listaTiposCustom = document.getElementById('pir-lista-tipos-custom');

    listaTiposCustom.innerHTML = TODOS_TIPOS.map(tp => `
      <div class="pir-opcao-tipo" data-valor="${tp}" style="cursor: pointer; display: inline-block;">
        <span class="tipo ${tp}" style="font-size: 10px; padding: 3px 8px; display: inline-block; font-weight: 600; border-radius: 4px;">${tp}</span>
      </div>
    `).join('');

    btnDropdown.onclick = (e) => {
      e.stopPropagation();
      menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
    };

    document.addEventListener('click', (e) => {
      if (!document.getElementById('pir-dropdown-container')?.contains(e.target)) {
        if (menuDropdown) menuDropdown.style.display = 'none';
      }
    });

    menuDropdown.querySelectorAll('.pir-opcao-tipo').forEach(opcao => {
      opcao.onclick = (e) => {
        e.stopPropagation();
        tipoAlvoAtual = opcao.getAttribute('data-valor');
        
        if (!tipoAlvoAtual) {
          spanSelecionado.innerHTML = '-- SEM ALVO --';
        } else {
          spanSelecionado.innerHTML = `<span class="tipo ${tipoAlvoAtual}" style="font-size: 10px; padding: 2px 6px; font-weight: 600; border-radius: 3px;">${tipoAlvoAtual}</span>`;
        }

        menuDropdown.style.display = 'none';
        atualizarTabelaGolpes(tipoAlvoAtual);
      };
    });

    function atualizarTabelaGolpes(tipoAlvo) {
      const tbody = document.getElementById('pir-tbody-golpes');
      tbody.innerHTML = dados.golpesAnalise.map(g => {
        let mult = 1;
        if (tipoAlvo) {
          mult = calcularEfetividadeAtacante(g.tipo, tipoAlvo, '');
        }
        const danoVsAlvo = Math.round(g.danoFinal * mult);
        
        let corMult = '#aaa';
        let textoMult = tipoAlvo ? ` (${mult}x)` : '';
        if (tipoAlvo) {
          if (mult > 1) corMult = '#6fd08a';
          else if (mult < 1 && mult > 0) corMult = '#ffc9bd';
          else if (mult === 0) corMult = '#888';
        }

        return `
          <tr>
            <td><b>${g.nome}</b></td>
            <td><span class="tipo ${g.tipo}">${g.tipo}</span></td>
            <td>${g.categoria}</td>
            <td><b>${g.power}</b></td>
            <td style="font-size: 11px; white-space: nowrap;">
              <span style="color: #ffc9bd;">${g.minCd}s</span> / 
              <b style="color: #6fd08a;">${g.cooldown}s</b> / 
              <span style="color: #ffe9a8;">${g.maxCd}s</span>
            </td>
            <td style="font-size: 11px; color: #aaa;">~${g.danoBase}</td>
            <td class="pir-destaque-dano" style="font-weight: 700; color: #6fd08a;">
              ~${danoVsAlvo} <span style="font-size: 10px; color: ${corMult};">${textoMult}</span>
            </td>
          </tr>
        `;
      }).join('');
    }

    atualizarTabelaGolpes('');
  }

  async function executarRate() {
    try {
      const PIH = window.__pokeidleHunt;
      if (!PIH || !PIH.carregarJogo) {
        alert('Aguarde o jogo carregar completamente.');
        return;
      }

      const nomeElemento = document.querySelector('.fi-nome');
      const nivelElemento = document.querySelector('.fi-nivel-chip');
      if (!nomeElemento) return;

      const nomePokemon = nomeElemento.innerText.trim();
      const nivel = parseInt(nivelElemento?.innerText.replace(/\D/g, '') || '100', 10);

      let especieTexto = '';
      const elementosEsp = document.querySelectorAll('*');
      for (const el of elementosEsp) {
        if (el.children.length === 0 && el.innerText && el.innerText.includes('Espécie:')) {
          especieTexto = el.innerText.replace('Espécie:', '').trim();
          break;
        }
      }

      const { especies, mod } = await PIH.carregarJogo();

      let especieAlvo = null;

      if (especieTexto) {
        for (const [id, esp] of especies.entries()) {
          if (esp.name && esp.name.toLowerCase() === especieTexto.toLowerCase()) {
            especieAlvo = esp;
            break;
          }
        }
      }

      if (!especieAlvo) {
        const nomeLimpo = nomePokemon.replace(/^(Shiny|Furious|Ancient|Psy|War|Brave)\s+/i, '').trim();
        for (const [id, esp] of especies.entries()) {
          if (esp.name && nomeLimpo.toLowerCase().includes(esp.name.toLowerCase())) {
            especieAlvo = esp;
            break;
          }
        }
      }

      if (!especieAlvo) {
        alert('Não foi possível identificar a espécie do Pokémon.');
        return;
      }

      const potenciaEl = document.querySelector('.fi-placa.pk-selo-pot b');
      const potenciaTexto = potenciaEl ? potenciaEl.innerText.trim() : 'P1';
      const numPotencia = parseInt(potenciaTexto.replace(/\D/g, '') || '1', 10);

      const qualidadeEl = document.querySelector('.fi-placa.pk-selo-q b');
      const qualidadeTexto = qualidadeEl ? qualidadeEl.innerText.trim().replace(',', '.') : '1.000';
      const qualidade = parseFloat(qualidadeTexto) || 1.000;

      const temTagShiny = Array.from(document.querySelectorAll('.pk-tag, .fi-tag, .pk-shiny, .fi-placa')).some(
        el => el.innerText && el.innerText.trim().toUpperCase() === 'SHINY'
      );
      const isShiny = temTagShiny || nomePokemon.toLowerCase().startsWith('shiny ');

      const lerIv = (nomeStat) => {
        for (const card of document.querySelectorAll('.fi-stat')) {
          if (card.querySelector('.fi-stat-nome')?.innerText.toUpperCase() === nomeStat) {
            const match = card.querySelector('.fi-iv')?.innerText.match(/\d+/);
            return match ? parseInt(match[0], 10) : 16;
          }
        }
        return 16;
      };

      const ivs = {
        hp: lerIv('HP'),
        atk: lerIv('ATK'),
        def: lerIv('DEF'),
        spAtk: lerIv('SP.ATK'),
        spDef: lerIv('SP.DEF'),
        speed: lerIv('SPD')
      };

      const parseStatNum = (el) => {
        if (!el) return 100;
        const limpo = el.innerText.replace(/\./g, '').replace(/\D/g, '');
        return parseInt(limpo, 10) || 100;
      };

      const statEls = document.querySelectorAll('.fi-stat-num');
      const stats = {
        hp: parseStatNum(statEls[0]),
        atk: parseStatNum(statEls[1]),
        def: parseStatNum(statEls[2]),
        spAtk: parseStatNum(statEls[3]),
        spDef: parseStatNum(statEls[4]),
        speed: parseStatNum(statEls[5])
      };

      const eficienciaStats = {};
      let somaPcts = 0;
      for (const [k, ivVal] of Object.entries(ivs)) {
        let pct = Math.round((ivVal / 32) * 100);
        eficienciaStats[k] = { iv: ivVal, pct: Math.min(100, Math.max(5, pct)) };
        somaPcts += pct;
      }

      const speedIv = ivs.speed;
      const speedPct = eficienciaStats.speed.pct;
      const reducaoCdPct = Number(((speedIv / 32) * 7).toFixed(1));

      const tipos = [especieAlvo.type1, especieAlvo.type2].filter(Boolean);
      const perfilOfensivo = analisarPerfilOfensivo(tipos);
      const perfilDefensivo = analisarPerfilDefensivo(especieAlvo.type1, especieAlvo.type2);

      const pokemonSimulado = {
        speciesId: especieAlvo.pokeId,
        level: nivel,
        ivs: ivs,
        stats: stats,
        tipos: tipos
      };

      const golpes = PIH.engine._interno.golpesDoPokemon(pokemonSimulado, especieAlvo, mod);
      const defesaPadrao = Math.max(50, nivel * 2.2);

      const baseAtkEspecie = especieAlvo.atk || 100;
      const baseSpAtkEspecie = especieAlvo.spAtk || 100;

      let poderFisicoTotal = 0;
      let poderEspecialTotal = 0;
      let fisicos = 0, especiais = 0;

      const golpesAnalise = golpes.map(g => {
        const ehFisico = g.category !== 'SPECIAL';
        const power = Math.max(15, g.power || 30);

        if (ehFisico) {
          fisicos++;
          poderFisicoTotal += power;
        } else {
          especiais++;
          poderEspecialTotal += power;
        }

        const ativAtk = ehFisico ? stats.atk : stats.spAtk;
        const baseStatEspecie = ehFisico ? baseAtkEspecie : baseSpAtkEspecie;

        const statBase100 = (baseStatEspecie + (2 * 16)) * (100 / 100);
        const baseDano100 = (((2 * 100 / 5) + 2) * power * (statBase100 / Math.max(50, 100 * 2.2))) / 50 + 2;

        const baseDanoFinal = ((2 * nivel / 5 + 2) * power * (ativAtk / defesaPadrao)) / 50 + 2;
        const temStab = tipos.includes(g.type);
        const stabMult = temStab ? 1.5 : 1.0;
        const shinyMult = isShiny ? 1.15 : 1.0;
        const danoFinalCalc = Math.round(baseDanoFinal * stabMult * shinyMult * 0.925);

        const cdMsOriginal = g.cooldownMs || 1000;
        const cdMsAtual = cdMsOriginal * (1 - (reducaoCdPct / 100));
        const cdMsMin = cdMsOriginal * (1 - (((1 / 32) * 7) / 100));
        const cdMsMax = cdMsOriginal * (1 - (7 / 100));

        return {
          nome: g.name,
          tipo: g.type,
          categoria: ehFisico ? 'Físico' : 'Especial',
          power: power,
          cooldown: (cdMsAtual / 1000).toFixed(1),
          minCd: (cdMsMin / 1000).toFixed(1),
          maxCd: (cdMsMax / 1000).toFixed(1),
          danoBase: Math.max(10, Math.round(baseDano100)),
          danoFinal: Math.max(10, danoFinalCalc)
        };
      });

      const speedData = { iv: speedIv };

      const poderGeral = Math.max(1, poderFisicoTotal + poderEspecialTotal);
      const pesoFisico = poderFisicoTotal / poderGeral;
      const pesoEspecial = poderEspecialTotal / poderGeral;

      const pctAtk = eficienciaStats.atk.pct;
      const pctSpAtk = eficienciaStats.spAtk.pct;

      let eficienciaOfensivaStats = 0;
      let ehHibridoSignificativo = (pesoFisico >= 0.25 && pesoEspecial >= 0.25);

      if (ehHibridoSignificativo) {
        eficienciaOfensivaStats = Math.round((pctAtk * pesoFisico) + (pctSpAtk * pesoEspecial));
      } else if (pesoFisico > pesoEspecial) {
        eficienciaOfensivaStats = pctAtk;
      } else {
        eficienciaOfensivaStats = pctSpAtk;
      }

      const eficienciaAtaque = Math.round((eficienciaOfensivaStats * 0.70) + (speedPct * 0.30));

      const hpPct = eficienciaStats.hp.pct;
      const defPct = eficienciaStats.def.pct;
      const spDefPct = eficienciaStats.spDef.pct;

      let menorDef = Math.min(defPct, spDefPct);
      let pesoDefensaBase = (hpPct * 0.30) + (defPct * 0.35) + (spDefPct * 0.35);
      
      if (menorDef < 35) {
        pesoDefensaBase = pesoDefensaBase * 0.85;
      }

      const eficienciaDefesa = Math.round(pesoDefensaBase);

      const qualidadePct = Math.min(100, Math.max(0, ((qualidade - 1.0) / 0.8) * 100));
      const potenciaPct = (numPotencia / 5) * 100;
      const baseEstrutural = (qualidadePct * 0.6) + (potenciaPct * 0.4);

      const notaReal = Math.round((eficienciaAtaque * 0.50) + (eficienciaDefesa * 0.30) + (baseEstrutural * 0.20));

      let analiseOfensiva = '';
      let analiseDefensiva = '';

      // ANÁLISE RIGOROSA E CRUZADA DE ATAQUE (Stat Principal + Speed)
      const principalFisico = pesoFisico >= pesoEspecial;
      const statChave = principalFisico ? 'ATK' : 'SP.ATK';
      const pctChave = principalFisico ? pctAtk : pctSpAtk;
      const ivChave = principalFisico ? ivs.atk : ivs.spAtk;

      const statForte = pctChave >= 75;
      const speedForte = speedPct >= 75;

      if (statForte && speedForte) {
        analiseOfensiva = `<b>${statChave} (${pctChave}%)</b> e Velocidade otimizada <b>(${speedPct}%)</b>: Dano bruto elevado com excelente agilidade e cooldowns rápidos.`;
      } else if (statForte && !speedForte) {
        analiseOfensiva = `<b>${statChave} (${pctChave}%)</b> em alto nível, porém penalizado por <span style="color: #ffc9bd; font-weight: 700;">⚠️ Speed Baixa (${speedPct}%)</span>: golpes causam dano forte mas demoram mais para recarregar.`;
      } else if (!statForte && speedForte) {
        analiseOfensiva = `<span style="color: #ff6464; font-weight: 700;">⚠️ Dano Reduzido (${statChave} ${pctChave}%):</span> O stat principal está baixo e limita o poder de fogo, mas conta com <span style="color: #6fd08a; font-weight: 700;">✨ Velocidade Excelente (${speedPct}%)</span> para agilizar a rotação (a agilidade ajuda na frequência, mas não substitui a falta de força bruta).`;
      } else {
        analiseOfensiva = `<span style="color: #ff6464; font-weight: 700;">⚠️ Dano Reduzido (${statChave} ${pctChave}%)</span> aliado a <span style="color: #ffc9bd; font-weight: 700;">⚠️ SPEED Baixa (${speedPct}%)</span>: Potencial ofensivo severamente comprometido em força e cadência.`;
      }

      // ANÁLISE DEFENSIVA RIGOROSA E CORRIGIDA (CRÍTICO APENAS < 35%)
      const defForte = defPct >= 75;
      const spDefForte = spDefPct >= 75;
      const defCritica = defPct < 35;
      const spDefCritica = spDefPct < 35;

      if (defCritica && spDefCritica) {
        analiseDefensiva = `<span style="color: #ff6464; font-weight: 700;">⚠️ Defesas Críticas (DEF ${defPct}% / SP.DEF ${spDefPct}%):</span> Papel puro! Dano massivo sofrido de qualquer fonte.`;
      } else if (defForte && !spDefCritica && !spDefForte) {
        analiseDefensiva = `Boa defesa física (<b>DEF ${defPct}%</b>), com <span style="color: #ffe9a8;">SP.DEF mediana (${spDefPct}%)</span>. Absorção equilibrada.`;
      } else if (!defCritica && !defForte && spDefForte) {
        analiseDefensiva = `Boa defesa especial (<b>SP.DEF ${spDefPct}%</b>), com <span style="color: #ffe9a8;">DEF mediana (${defPct}%)</span>. Absorção equilibrada.`;
      } else if (defCritica) {
        analiseDefensiva = `<span style="color: #ffc9bd; font-weight: 700;">⚠️ DEF Crítica (${defPct}%):</span> Alta vulnerabilidade a golpes físicos (HP ${hpPct}% / SP.DEF ${spDefPct}%).`;
      } else if (spDefCritica) {
        analiseDefensiva = `<span style="color: #ffc9bd; font-weight: 700;">⚠️ SP.DEF Crítica (${spDefPct}%):</span> Alta vulnerabilidade a golpes especiais (HP ${hpPct}% / DEF ${defPct}%).`;
      } else if (defForte && spDefForte) {
        analiseDefensiva = `Blindagem completa (<b>HP ${hpPct}% / DEF ${defPct}% / SP.DEF ${spDefPct}%</b>). Excelente sustentabilidade contra qualquer tipo de dano.`;
      } else {
        analiseDefensiva = `Sustentabilidade mediana (<b>HP ${hpPct}% / DEF ${defPct}% / SP.DEF ${spDefPct}%</b>). Absorção de dano moderada.`;
      }

      let veredito = {
        tituloNota: 'MEDIANO',
        classe: 'mediano',
        notaReal: notaReal,
        eficienciaAtaque: eficienciaAtaque,
        eficienciaDefesa: eficienciaDefesa,
        analiseOfensiva: analiseOfensiva,
        analiseDefensiva: analiseDefensiva,
        resumoCabecalho: ''
      };

      if (notaReal >= 80) {
        veredito.tituloNota = 'EXCELENTE';
        veredito.classe = 'excelente';
        veredito.resumoCabecalho = 'Alta eficiência com excelente sinergia de ataque e defensiva.';
      } else if (notaReal >= 65) {
        veredito.tituloNota = 'ÓTIMA';
        veredito.classe = 'otima';
        veredito.resumoCabecalho = 'Ótimo desempenho geral, com alta consistência e excelente entrega em combate.';
      } else if (notaReal >= 45) {
        veredito.tituloNota = 'MEDIANO';
        veredito.classe = 'mediano';
        veredito.resumoCabecalho = 'Desempenho equilibrado. Atende aos requisitos operacionais sem grandes destaques.';
      } else if (notaReal >= 30) {
        veredito.tituloNota = 'RUIM';
        veredito.classe = 'ruim';
        veredito.resumoCabecalho = 'Descompensação relevante em defesas ou atributo de ataque principal.';
      } else {
        veredito.tituloNota = 'HORRÍVEL';
        veredito.classe = 'horrivel';
        veredito.resumoCabecalho = 'Atributos defensivos e de dano totalmente comprometidos.';
      }

      mostrarModalResumo({
        nome: nomePokemon,
        especieNome: especieAlvo.name,
        nivel: nivel,
        potencia: potenciaTexto,
        qualidade: qualidade.toFixed(3),
        isShiny: isShiny,
        tipos: tipos,
        perfilOfensivo: perfilOfensivo,
        perfilDefensivo: perfilDefensivo,
        eficienciaStats: eficienciaStats,
        speedData: speedData,
        golpesAnalise: golpesAnalise,
        veredito: veredito
      });

    } catch (e) {
      console.error('[ /rate ] Erro:', e);
      alert('Erro ao processar os dados do /rate.');
    }
  }
})(globalThis);
