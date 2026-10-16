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
          <span style="color: ${info.pct >= 70 ? '#6fd08a' : info.pct >= 40 ? '#ffe9a8' : '#ffc9bd'};">${info.pct}%</span>
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
        <div class="pir-secao-tit">Veredito Mastigado da Build</div>
        <div class="pir-caixa">
          <div class="pir-veredito-box ${dados.veredito.classe}">
            <div class="pir-veredito-top">
              <span class="pir-veredito-status ${dados.veredito.classe}">${dados.veredito.titulo}</span>
              <span style="font-weight: 700; color: #ffe9a8;">Eficiência Útil: ${dados.veredito.scoreUtil}%</span>
            </div>
            <div class="pir-veredito-desc" style="margin-top:6px;">${dados.veredito.explicacao}</div>
          </div>
        </div>

        <div class="pir-secao-tit">Eficiência dos Status (Roll vs Teto Perfeito P5 / Q1.80 / IV32)</div>
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

      const { especies, mod } = await PIH.carregarJogo();

      let especieAlvo = null;
      for (const [id, esp] of especies.entries()) {
        if (esp.name && nomePokemon.toLowerCase().includes(esp.name.toLowerCase())) {
          especieAlvo = esp;
          break;
        }
      }
      if (!especieAlvo) return;

      const potenciaEl = document.querySelector('.fi-placa.pk-selo-pot b');
      const potencia = potenciaEl ? potenciaEl.innerText.trim() : 'P1';

      const qualidadeEl = document.querySelector('.fi-placa.pk-selo-q b');
      const qualidadeTexto = qualidadeEl ? qualidadeEl.innerText.trim().replace(',', '.') : '1.000';
      const qualidade = parseFloat(qualidadeTexto) || 1.000;

      const isShiny = document.body.innerText.includes('Shiny') || document.querySelector('.pk-shiny') !== null;

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

      const stats = {
        hp: parseInt(document.querySelectorAll('.fi-stat-num')[0]?.innerText || 100, 10),
        atk: parseInt(document.querySelectorAll('.fi-stat-num')[1]?.innerText || 100, 10),
        def: parseInt(document.querySelectorAll('.fi-stat-num')[2]?.innerText || 100, 10),
        spAtk: parseInt(document.querySelectorAll('.fi-stat-num')[3]?.innerText || 100, 10),
        spDef: parseInt(document.querySelectorAll('.fi-stat-num')[4]?.innerText || 100, 10),
        speed: parseInt(document.querySelectorAll('.fi-stat-num')[5]?.innerText || 100, 10)
      };

      const eficienciaStats = {};
      const fatorQualidade = Math.min(1, qualidade / 1.80);

      for (const [k, ivVal] of Object.entries(ivs)) {
        let pct = Math.round((ivVal / 32) * fatorQualidade * 100);
        eficienciaStats[k] = { iv: ivVal, pct: Math.min(100, Math.max(5, pct)) };
      }

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

      // ---- LÓGICA DO VEREDITO ANATOMIZADO E MASTIGADO ----
      const ehFocoEspecial = especiais >= fisicos;
      const statChaveNome = ehFocoEspecial ? 'SP.ATK' : 'ATK';
      const pctStatChave = ehFocoEspecial ? eficienciaStats.spAtk.pct : eficienciaStats.atk.pct;
      const ivStatChave = ehFocoEspecial ? ivs.spAtk : ivs.atk;
      const pctLadoOposto = ehFocoEspecial ? eficienciaStats.atk.pct : eficienciaStats.spAtk.pct;

      // Média dos status defensivos (HP + DEF + SPDEF)
      const mediaDefensiva = Math.round((eficienciaStats.hp.pct + eficienciaStats.def.pct + eficienciaStats.spDef.pct) / 3);

      let veredito = {
        titulo: 'Bom',
        classe: 'bom',
        scoreUtil: Math.round(pctStatChave * 0.75 + eficienciaStats.speed.pct * 0.25),
        explicacao: ''
      };

      // Cenário 1: "Atacante Perfeito" (O status ofensivo que importa veio alto)
      if (pctStatChave >= 75) {
        if (mediaDefensiva < 45) {
          veredito.titulo = '⚡ Glass Cannon — Bate Muito / Levemente Papel';
          veredito.classe = 'excelente';
          veredito.explicacao = `<b>MUITO BOM PARA FARM/DANO!</b> As habilidades do kit usam <b>Dano ${ehFocoEspecial ? 'Especial' : 'Físico'}</b>, e o seu <b>${statChaveNome} (IV ${ivStatChave}/32 - ${pctStatChave}%)</b> veio Excelente! A nota geral do jogo pode cair por conta das defesas/HP baixos, mas para o que interessa (causar dano nas hunts), ele vai bater o máximo do potencial da espécie!`;
        } else {
          veredito.titulo = '🟢 Excelente — Vale Muito a Pena Upar!';
          veredito.classe = 'excelente';
          veredito.explicacao = `<b>PERFEITO!</b> O kit foca em dano <b>${ehFocoEspecial ? 'Especial' : 'Físico'}</b> e o <b>${statChaveNome} (IV ${ivStatChave}/32 - ${pctStatChave}%)</b> acompanhou em alto nível, junto com boa sustentação defensiva. Build muito redonda!`;
        }
      } 
      // Cenário 2: Status Ofensivo Mediano
      else if (pctStatChave >= 50) {
        veredito.titulo = '🟡 Usável / Mediano — Desempenho Justo';
        veredito.classe = 'bom';
        veredito.explicacao = `O kit é <b>${ehFocoEspecial ? 'Especial' : 'Físico'}</b> (${ehFocoEspecial ? especiais : fisicos} golpes), e o seu <b>${statChaveNome} (IV ${ivStatChave}/32 - ${pctStatChave}%)</b> é mediano. Ele não vai bater o topo da espécie, mas é totalmente funcional para hunts normais e uso do dia a dia.`;
      } 
      // Cenário 3: Status Ofensivo Baixo (Trolado no lado do Ataque)
      else if (pctStatChave < 50 && pctLadoOposto >= 65) {
        veredito.titulo = '⚠️ Status Invertido — O Jogo Trolou no Ataque!';
        veredito.classe = 'subotimo';
        veredito.explicacao = `<b>ATENÇÃO:</b> As habilidades principais deste Pokémon exigem <b>${statChaveNome}</b> (que veio ruim: IV ${ivStatChave}/32 - ${pctStatChave}%), porém o status do lado oposto veio alto (${pctLadoOposto}%). Como as habilidades não aproveitam esse status oposto, o dano real dele nas habilidades será bem abaixo do esperado!`;
      } 
      // Cenário 4: Fraco Geral
      else {
        veredito.titulo = '🔴 Fraco — Não Vale o Investimento';
        veredito.classe = 'ruim';
        veredito.explicacao = `O status ofensivo principal <b>${statChaveNome} (IV ${ivStatChave}/32 - ${pctStatChave}%)</b> veio muito baixo. O dano das habilidades ficará comprometido e não compensa gastar pedras/recursos de refino neste nascimento.`;
      }

      mostrarModalResumo({
        nome: nomePokemon,
        nivel: nivel,
        potencia: potencia,
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