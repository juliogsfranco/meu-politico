const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const POLITICOS_FILE = path.join(__dirname, 'data', 'politicos.json');
const NOTICIAS_FILE = path.join(__dirname, 'data', 'noticias.json');

// GET /api/busca?q=termo
router.get('/', (req, res) => {
  const { q = '', limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'Parâmetro q é obrigatório' });

  try {
    let politicos = [];
    if (fs.existsSync(POLITICOS_FILE)) {
      politicos = JSON.parse(fs.readFileSync(POLITICOS_FILE, 'utf8'));
      politicos = politicos.filter(p =>
        p.nome.toLowerCase().includes(q.toLowerCase()) ||
        p.partido.toLowerCase().includes(q.toLowerCase()) ||
        p.estado.toLowerCase().includes(q.toLowerCase())
      ).slice(0, limit);
    }

    let noticias = [];
    if (fs.existsSync(NOTICIAS_FILE)) {
      noticias = JSON.parse(fs.readFileSync(NOTICIAS_FILE, 'utf8'));
      noticias = noticias.filter(n =>
        n.titulo.toLowerCase().includes(q.toLowerCase()) ||
        n.fonte.toLowerCase().includes(q.toLowerCase())
      ).slice(0, limit);
    }

    res.json({ query: q, politicos, noticias });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao processar busca' });
  }
});

module.exports = router;
