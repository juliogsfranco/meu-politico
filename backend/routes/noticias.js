const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '..', 'data', 'noticias.json');

// Garante que o arquivo exista
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

// GET /api/noticias
router.get('/', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, raw) => {
    if (err) return res.status(500).json({ error: 'Não foi possível ler noticias.json' });

    try {
      let data = JSON.parse(raw);

      const { fonte, titulo, dataInicio, dataFim, politico, page = 1, limit = 20 } = req.query;

      if (fonte) data = data.filter(n => n.fonte?.toLowerCase().includes(fonte.toLowerCase()));
      if (titulo) data = data.filter(n => n.titulo?.toLowerCase().includes(titulo.toLowerCase()));
      if (politico) data = data.filter(n => n.titulo?.toLowerCase().includes(politico.toLowerCase()));
      if (dataInicio) data = data.filter(n => new Date(n.data) >= new Date(dataInicio));
      if (dataFim) data = data.filter(n => new Date(n.data) <= new Date(dataFim));

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const start = (pageNum - 1) * limitNum;
      const end = start + limitNum;
      const pagedData = data.slice(start, end);

      res.json({
        total: data.length,
        page: pageNum,
        limit: limitNum,
        results: pagedData
      });
    } catch {
      res.status(500).json({ error: 'Arquivo noticias.json inválido' });
    }
  });
});

// GET /api/noticias/:id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile(DATA_FILE, 'utf8', (err, raw) => {
    if (err) return res.status(500).json({ error: 'Não foi possível ler noticias.json' });
    try {
      const data = JSON.parse(raw);
      const item = data.find(n => n.id === id);
      if (!item) return res.status(404).json({ error: 'Notícia não encontrada' });
      res.json(item);
    } catch {
      res.status(500).json({ error: 'Arquivo noticias.json inválido' });
    }
  });
});

module.exports = router;
