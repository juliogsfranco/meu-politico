const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const DATA_FILE = path.join(__dirname, '..', 'data', 'noticias.json');
const GNEWS_KEY = process.env.GNEWS_KEY || '752f1805baa9021aa2bc07a937b2b274';

// Garante que o arquivo exista
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

// GET /api/noticias
router.get('/', async (req, res) => {
  const { fonte, titulo, dataInicio, dataFim, politico, page = 1, limit = 20 } = req.query;

  // 🔎 Caso: buscar notícias de um político em tempo real (GNews)
  if (politico) {
    if (!GNEWS_KEY) {
      return res.status(500).json({ error: 'Chave da GNews não configurada' });
    }
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(politico)}&lang=pt&country=br&max=${limit}&token=${GNEWS_KEY}`;
      const r = await axios.get(url);
      const items = (r.data.articles || []).map((a, i) => ({
        id: `gnews-${Date.now()}-${i}`,
        titulo: a.title,
        fonte: a.source?.name || '',
        data: a.publishedAt,
        link: a.url
      }));
      return res.json({ total: items.length, page: 1, limit: limit, results: items });
    } catch (e) {
      console.error('Erro GNews político:', e.message || e);
      return res.status(500).json({ error: 'Erro ao buscar notícias na GNews' });
    }
  }

  // 🔎 Caso: buscar notícias salvas no arquivo local
  fs.readFile(DATA_FILE, 'utf8', (err, raw) => {
    if (err) return res.status(500).json({ error: 'Não foi possível ler noticias.json' });
    try {
      let data = JSON.parse(raw);

      if (fonte)  data = data.filter(n => (n.fonte || '').toLowerCase().includes(fonte.toLowerCase()));
      if (titulo) data = data.filter(n => (n.titulo || '').toLowerCase().includes(titulo.toLowerCase()));
      if (dataInicio) data = data.filter(n => new Date(n.data) >= new Date(dataInicio));
      if (dataFim)    data = data.filter(n => new Date(n.data) <= new Date(dataFim));

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const start = (pageNum - 1) * limitNum;
      const pagedData = data.slice(start, start + limitNum);

      res.json({ total: data.length, page: pageNum, limit: limitNum, results: pagedData });
    } catch {
      res.status(500).json({ error: 'Arquivo noticias.json inválido' });
    }
  });
});

module.exports = router;
