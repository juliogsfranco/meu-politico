const express = require('express');
const router = express.Router();
const axios = require('axios');

const CAMARA = process.env.CAMARA_BASE || 'https://dadosabertos.camara.leg.br/api/v2';
const SENADO = process.env.SENADO_BASE || 'https://legis.senado.leg.br/dadosabertos';

// 🔎 Votações da Câmara por deputado
router.get('/camara/:idDeputado', async (req, res) => {
  try {
    const { idDeputado } = req.params;

    // Pega votações recentes
    const urlVotacoes = `${CAMARA}/votacoes?itens=5&ordem=DESC`;
    const lista = await axios.get(urlVotacoes, { headers: { 'Accept': 'application/json' } });

    const resultados = [];
    for (const v of lista.data.dados) {
      const urlVotos = `${CAMARA}/votacoes/${v.id}/votos`;
      const rVotos = await axios.get(urlVotos, { headers: { 'Accept': 'application/json' } });
      const voto = rVotos.data.dados.find(vt => String(vt.deputado_.id) === idDeputado);
      resultados.push({
        id: v.id,
        data: v.data,
        descricao: v.descricao,
        voto: voto ? voto.opcaoVoto : "Não encontrado"
      });
    }

    res.json(resultados);
  } catch (e) {
    console.error("Erro votações Câmara:", e.message || e);
    res.status(500).json({ error: "Erro ao buscar votações da Câmara" });
  }
});

// 🔎 Votações do Senado (todas)
router.get('/senado/:idSenador', async (req, res) => {
  try {
    const { idSenador } = req.params;

    const url = `${SENADO}/plenario/lista/votacao?format=json`;
    const r = await axios.get(url, { headers: { 'Accept': 'application/json' } });

    const lista = r.data?.ListaVotacoes?.Votacoes?.Votacao || [];
    const resultados = [];

    lista.slice(0, 5).forEach(v => {
      let votoSenador = "Não encontrado";
      if (v.Votos && v.Votos.VotoParlamentar) {
        const votos = Array.isArray(v.Votos.VotoParlamentar) ? v.Votos.VotoParlamentar : [v.Votos.VotoParlamentar];
        const meuVoto = votos.find(vt => String(vt.CodigoParlamentar) === idSenador);
        votoSenador = meuVoto ? meuVoto.Voto : votoSenador;
      }
      resultados.push({
        id: v.CodigoSessao,
        data: v.DataSessao,
        descricao: v.MateriaVotada?.DescricaoMateria,
        voto: votoSenador
      });
    });

    res.json(resultados);
  } catch (e) {
    console.error("Erro votações Senado:", e.message || e);
    res.status(500).json({ error: "Erro ao buscar votações do Senado" });
  }
});

module.exports = router;
