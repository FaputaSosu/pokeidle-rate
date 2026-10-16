(function (root) {
  'use strict';

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
      <div class="pir-stat-item">
        <div class="pir-stat-info">
          <span>${stat.toUpperCase()} (IV ${info.iv}/32)</span>
          <span style="color: ${info.pct >= 75 ? '#6fd08a' : info.pct >= 45 ? '#ffe9a8' : '#ffc9bd'};">${info.pct}%</span>
        </div>
        <div class="pir-stat-bar">
          <div class="pir-stat-fill" style="width: ${info.pct}%;"></div>
        </div>
      </div>
    `).join('');

    const linhasGolpesHTML = dados.golpesAnalise.map(g => `
      <tr>
        <td><b>${g.nome}</b></td>
        <td><span class="tipo ${g.tipo}">${g.tipo}</span></td>
        <td>${g.categoria}</td>
        <td><b>${g.power}</b></td>
        <td>${g.cooldown}s</td>
        <td class="pir-destaque-dano">~${g.danoEstimado}</td>
      </tr>
    `).join('');

    painel.innerHTML = `
      <div class="pir-cab">
        <div class="pir-titulo">
          <h3>/rate — Visão Geral & Eficiência</h3>
          <small>${dados.nome} (Nv ${dados.nivel}) | Potência: <b>${dados.potencia}</b> | Qualidade: <b>${dados.qualidade}</b> ${dados.isShiny ? '| ✨ <b>Shiny</b>' : ''}</small>
        </div>
        <button class="pir-fechar" id="pir-btn-fechar">×</button>
      </div>

      <div class="pir-corpo">
        <div class="pir-secao-tit">Veredito Resumido da Build</div>
        <div class="pir-caixa">
          <div class="pir-veredito-box ${dados.veredito.classe}">
            <div class="pir-veredito-top">
              <span class="pir-veredito-status ${dados.veredito.classe}">${dados.veredito.titulo}</span>
              <span style="font-weight: 700; color: #ffe9a8;">Nota Real: ${dados.veredito.notaReal}%</span>
            </div>
            <div class="pir-veredito-desc" style="margin-top:6px;">${dados.veredito.explicacao}</div>
          </div>
        </div>

        <div class="pir-secao-tit">Eficiência dos Status (Roll Puro vs Teto IV32)</div>
        <div class="pir-caixa">
          <div class="pir-grid-stats">
            ${statsHTML}
          </div>
        </div>

        <div class="pir-secao-tit">Preview de Dano das Habilidades (Fórmula Oficial)</div>
        <div class="pir-caixa pir-tabela-wrap">
          <table class="pir-tabela">
            <thead>
              <tr>
                <th>Golpe</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Poder</th>
                <th>Cooldown</th>
                <th>Dano Estimado</th>
              </tr>
            </thead>
            <tbody>
              ${linhasGolpesHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(painel);
    document.querySelector('#pir-btn-fechar').onclick = fecharPainel;
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

      const tipos = [especieAlvo.type1, especieAlvo.type2].filter(Boolean);

      const pokemonSimulado = {
        speciesId: especieAlvo.pokeId,
        level: nivel,
        ivs: ivs,
        stats: stats,
        tipos: tipos
      };

      const golpes = PIH.engine._interno.golpesDoPokemon(pokemonSimulado, especieAlvo, mod);
      const defesaPadrao = Math.max(50, nivel * 2.2);

      let fisicos = 0, especiais = 0;
      const golpesAnalise = golpes.map(g => {
        const ehFisico = g.category !== 'SPECIAL';
        if (ehFisico) fisicos++; else especiais++;

        const power = Math.max(15, g.power || 30);
        const ativAtk = ehFisico ? stats.atk : stats.spAtk;

        const baseDano = ((2 * nivel / 5 + 2) * power * (ativAtk / defesaPadrao)) / 50 + 2;
        const temStab = tipos.includes(g.type);
        const stabMult = temStab ? 1.5 : 1.0;
        const shinyMult = isShiny ? 1.15 : 1.0;

        const danoFinal = Math.round(baseDano * stabMult * shinyMult * 0.925);
        const cdSegundos = ((g.cooldownMs || 1000) / 1000).toFixed(1);

        return {
          nome: g.name,
          tipo: g.type,
          categoria: ehFisico ? 'Físico' : 'Especial',
          power: power,
          cooldown: cdSegundos,
          danoEstimado: Math.max(10, danoFinal)
        };
      });

      const ehFocoEspecial = especiais >= fisicos;
      const statChaveNome = ehFocoEspecial ? 'SP.ATK' : 'ATK';
      const pctStatChave = ehFocoEspecial ? eficienciaStats.spAtk.pct : eficienciaStats.atk.pct;
      const ivStatChave = ehFocoEspecial ? ivs.spAtk : ivs.atk;
      const pctLadoOposto = ehFocoEspecial ? eficienciaStats.atk.pct : eficienciaStats.spAtk.pct;

      // Ponderação estrutural baseada na fórmula oficial (Qualidade + Potência + IV do Ataque Util)
      const qualidadePct = Math.min(100, Math.max(0, ((qualidade - 1.0) / 0.8) * 100));
      const potenciaPct = (numPotencia / 5) * 100;
      const baseEstrutural = (qualidadePct * 0.6) + (potenciaPct * 0.4);

      // Nota real cruzando o stat útil com a carcaça estrutural e a média geral dos IVs
      const notaReal = Math.round((pctStatChave * 0.5) + (baseEstrutural * 0.3) + (mediaIvs * 0.2));

      let veredito = {
        titulo: 'Bom',
        classe: 'bom',
        notaReal: notaReal,
        explicacao: ''
      };

      if (pctStatChave >= 85 && baseEstrutural >= 60) {
        veredito.titulo = '🟢 Bom — Vale a Pena Investir';
        veredito.classe = 'excelente';
        veredito.explicacao = `<b>Ótimo nascimento!</b> O <b>${statChaveNome}</b> veio alto (IV ${ivStatChave}/32 - ${pctStatChave}%), garantindo o dano máximo esperado para as habilidades desta espécie.`;
      } else if (pctStatChave >= 75 && baseEstrutural < 40) {
        veredito.titulo = '🟡 Bom IV, mas Potência Baixa';
        veredito.classe = 'bom';
        veredito.explicacao = `<b>Ótimo roll de ataque (${statChaveNome} a ${pctStatChave}%), mas travado pela estrutura (${potenciaTexto} / Q${qualidade}).</b> Bate bem pelo IV perfeito que escala nos níveis, mas o teto global é limitado.`;
      } else if (pctStatChave >= 50) {
        veredito.titulo = '🟡 Usável — Quebra Galho';
        veredito.classe = 'bom';
        veredito.explicacao = `<b>Desempenho medianamente aceitável.</b> O <b>${statChaveNome} (${pctStatChave}%)</b> funciona para o dia a dia, mas não é um nascimento de elite.`;
      } else if (pctStatChave < 45 && pctLadoOposto >= 65) {
        veredito.titulo = '⚠️ O Jogo Trolou (Status Invertido)';
        veredito.classe = 'subotimo';
        veredito.explicacao = `<b>Ataque no lado errado!</b> O kit principal de golpes exige <b>${statChaveNome}</b> (que veio fraco: ${pctStatChave}%), mas o jogo jogou o status alto para o lado oposto. O dano real será limitado.`;
      } else {
        veredito.titulo = '🔴 Ruim — Não Vale a Pena';
        veredito.classe = 'ruim';
        veredito.explicacao = `<b>Ataque muito baixo.</b> O <b>${statChaveNome} (${pctStatChave}%)</b> veio fraco, comprometendo o potencial de dano das habilidades.`;
      }

      mostrarModalResumo({
        nome: nomePokemon,
        especieNome: especieAlvo.name,
        nivel: nivel,
        potencia: potenciaTexto,
        qualidade: qualidade.toFixed(3),
        isShiny: isShiny,
        eficienciaStats: eficienciaStats,
        golpesAnalise: golpesAnalise,
        veredito: veredito
      });

    } catch (e) {
      console.error('[ /rate ] Erro:', e);
      alert('Erro ao processar os dados do /rate.');
    }
  }
})(globalThis);
