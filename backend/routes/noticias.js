const express = require('express');
const router = express.Router();
const axios = require('axios');

const GNEWS_KEY = process.env.GNEWS_KEY || '752f1805baa9021aa2bc07a937b2b274';

// GET /api/noticias
router.get('/', async (req, res) => {
  const { politico, q, limit = 10 } = req.query;

  if (!GNEWS_KEY) {
    return res.status(500).json({ error: 'Chave da GNews não configurada' });
  }

  try {
    let termo = q || politico || "deputado OR senador OR congresso";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(termo)}&lang=pt&country=br&max=${limit}&token=${GNEWS_KEY}`;
    const r = await axios.get(url);

    const items = (r.data.articles || []).map((a, i) => ({
      id: `gnews-${Date.now()}-${i}`,
      titulo: a.title,
      fonte: a.source?.name || '',
      data: a.publishedAt,
      link: a.url
    }));

    res.json({ total: items.length, results: items });
  } catch (e) {
    console.error('Erro API GNews:', e.message || e);
    res.status(500).json({ error: 'Falha ao acessar GNews' });
  }
});

module.exports = router;
