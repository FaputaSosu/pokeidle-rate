(function (root) {
  'use strict';

  // Matriz de Efetividade de Tipos Clássica (Atacante -> Defensor)
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
    btn.innerHTML = `<span class="pir-tag">/rate</span> Analisar Status`;

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

    // Aplicando a classe oficial .tipo \${item.tipo} para estilizar igualzinho às habilidades
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

    const optionsTiposHTML = `<option value="" selected>-- Nenhum (Dano Padrão) --</option>` + 
      TODOS_TIPOS.map(tp => `<option value="${tp}">${tp}</option>`).join('');

    painel.innerHTML = `
      <div class="pir-cab">
        <div class="pir-titulo">
          <h3>/rate — Visão Geral & Eficiência</h3>
          <small>${dados.nome} (Nv ${dados.nivel}) | Tipos: <b>${dados.tipos.join(' / ')}</b> | Potência: <b>${dados.potencia}</b> | Qualidade: <b>${dados.qualidade}</b></small>
        </div>
        <button class="pir-fechar" id="pir-btn-fechar">×</button>
      </div>

      <div class="pir-corpo">
        <div class="pir-secao-tit">Veredito Resumido da Build</div>
        <div class="pir-caixa">
          <div class="pir-veredito-box ${dados.veredito.classe}">
            <div class="pir-veredito-top">
              <span class="pir-veredito-status ${dados.veredito.classe}">${dados.veredito.titulo}</span>
              <span style="font-weight: 700; color: #ffe9a8;">Nota Geral: ${dados.veredito.notaReal}%</span>
            </div>
            <div class="pir-veredito-desc" style="margin-top:6px;">${dados.veredito.explicacao}</div>
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
              <div style="font-weight: 700; color: #6fd08a; margin-bottom: 3px;">Ataques (O que esta espécie tem vantagem)

</div>
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
          <div style="font-size: 12px; font-weight: normal;">
            <label for="pir-select-alvo">Alvo Defensor:</label>
            <select id="pir-select-alvo" style="background: #222; color: #fff; border: 1px solid #444; padding: 4px 10px; border-radius: 4px; margin-left: 6px; font-size: 12px;">
              ${optionsTiposHTML}
            </select>
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

    const selectAlvo = document.getElementById('pir-select-alvo');

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

    selectAlvo.onchange = (e) => {
      atualizarTabelaGolpes(e.target.value);
    };

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
      
      const mediaIvs = somaPcts / 6;
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

      let fisicos = 0, especiais = 0;
      const golpesAnalise = golpes.map(g => {
        const ehFisico = g.category !== 'SPECIAL';
        if (ehFisico) fisicos++; else especiais++;

        const power = Math.max(15, g.power || 30);
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

      const ehFocoEspecial = especiais >= fisicos;
      const statChaveNome = ehFocoEspecial ? 'SP.ATK' : 'ATK';
      const pctStatChave = ehFocoEspecial ? eficienciaStats.spAtk.pct : eficienciaStats.atk.pct;
      const ivStatChave = ehFocoEspecial ? ivs.spAtk : ivs.atk;
      const pctLadoOposto = ehFocoEspecial ? eficienciaStats.atk.pct : eficienciaStats.spAtk.pct;

      const qualidadePct = Math.min(100, Math.max(0, ((qualidade - 1.0) / 0.8) * 100));
      const potenciaPct = (numPotencia / 5) * 100;
      const baseEstrutural = (qualidadePct * 0.6) + (potenciaPct * 0.4);

      const notaReal = Math.round((pctStatChave * 0.45) + (baseEstrutural * 0.30) + (mediaIvs * 0.15) + (speedPct * 0.10));

      let veredito = {
        titulo: 'Bom',
        classe: 'bom',
        notaReal: notaReal,
        explicacao: ''
      };

      if (pctStatChave >= 85 && speedPct >= 75 && baseEstrutural >= 60) {
        veredito.titulo = '🟢 Excelente — Sinergia Perfeita';
        veredito.classe = 'excelente';
        veredito.explicacao = `<b>Nascimento de elite absoluta!</b> O <b>${statChaveNome}</b> atingiu patamar elevado (IV ${ivStatChave}/32 - ${pctStatChave}%) alinhado a uma <b>Velocidade expressiva (${speedPct}%)</b>, garantindo excelente rendimento de dano e otimização nos tempos de recarga das habilidades.`;
      } else if (pctStatChave >= 75 && speedPct < 40) {
        veredito.titulo = '🟡 Usável — Ótimo Ataque com Velocidade Defasada';
        veredito.classe = 'bom';
        veredito.explicacao = `<b>Bom rendimento ofensivo (${statChaveNome} a ${pctStatChave}%), porém limitado pela Velocidade baixa (${speedPct}%).</b> O potencial de dano é sólido, mas os tempos de recarga das habilidades sofrem penalidade devido à lentidão do espécime.`;
      } else if (pctStatChave >= 75 && baseEstrutural < 40) {
        veredito.titulo = '🟡 Usável — IV Alto com Estrutura Limitada';
        veredito.classe = 'bom';
        veredito.explicacao = `<b>Desempenho viável pelo roll de ataque (${statChaveNome} a ${pctStatChave}%), porém restrito pela base estrutural (${potenciaTexto} / Q${qualidade}).</b> Apresenta entrega adequada devido ao IV máximo, mas com teto global reduzido.`;
      } else if (pctStatChave >= 50) {
        veredito.titulo = '🟡 Usável — Aceitável';
        veredito.classe = 'bom';
        veredito.explicacao = `<b>Desempenho intermediário.</b> O <b>${statChaveNome} (${pctStatChave}%)</b> atende aos requisitos básicos de combate, com a Velocidade em ${speedPct}% impactando o intervalo de ativação das habilidades.`;
      } else if (pctStatChave < 45 && pctLadoOposto >= 65) {
        veredito.titulo = '⚠️ Status Invertido';
        veredito.classe = 'subotimo';
        veredito.explicacao = `<b>Divergência de atributos.</b> O conjunto de habilidades exige <b>${statChaveNome}</b> (atualmente em ${pctStatChave}%), mas o valor mais alto foi alocado no atributo oposto. O dano efetivo sofrerá restrições.`;
      } else {
        veredito.titulo = '🔴 Ruim — Não Recomendado';
        veredito.classe = 'ruim';
        veredito.explicacao = `<b>Atributo de ataque insuficiente.</b> O <b>${statChaveNome} (${pctStatChave}%)</b> veio abaixo do ideal, comprometendo o rendimento ofensivo das habilidades.`;
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
