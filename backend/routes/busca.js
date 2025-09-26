const express = require('express');
const router = express.Router();
const axios = require('axios');

const CAMARA = process.env.CAMARA_BASE || 'https://dadosabertos.camara.leg.br/api/v2';
const SENADO = process.env.SENADO_BASE || 'https://legis.senado.leg.br/dadosabertos';
const GNEWS_KEY = process.env.GNEWS_KEY || '752f1805baa9021aa2bc07a937b2b274';

// GET /api/busca?q=termo
router.get('/', async (req, res) => {
  const { q = '', limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'Parâmetro q é obrigatório' });

  try {
    // 🔎 Deputados
    let deputados = [];
    try {
      const r = await axios.get(`${CAMARA}/deputados?nome=${encodeURIComponent(q)}&itens=${limit}`, { headers: { 'Accept': 'application/json' } });
      deputados = r.data?.dados || [];
    } catch (e) {
      console.error('Erro busca Câmara:', e.message || e);
    }

    // 🔎 Senadores
    let senadores = [];
    try {
      const r = await axios.get(`${SENADO}/senador/lista/atual?format=json`);
      const lista = r.data?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar || [];
      senadores = lista.filter(p =>
        (p?.IdentificacaoParlamentar?.NomeParlamentar || '').toLowerCase().includes(q.toLowerCase())
      ).slice(0, limit);
    } catch (e) {
      console.error('Erro busca Senado:', e.message || e);
    }

    // 🔎 Notícias (GNews)
    let noticias = [];
    if (GNEWS_KEY) {
      try {
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=pt&country=br&max=${limit}&token=${GNEWS_KEY}`;
        const r = await axios.get(url);
        noticias = (r.data.articles || []).map((a, i) => ({
          id: `gnews-${Date.now()}-${i}`,
          titulo: a.title,
          fonte: a.source?.name || '',
          data: a.publishedAt,
          link: a.url
        }));
      } catch (e) {
        console.error('Erro busca GNews:', e.message || e);
      }
    }

    res.json({ query: q, deputados, senadores, noticias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar busca' });
  }
});

module.exports = router;
