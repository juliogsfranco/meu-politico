const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '..', 'data', 'politicos.json');

// GET /api/politicos (com filtros e paginação)
router.get('/', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, raw) => {
    if (err) return res.status(500).json({ error: 'Não foi possível ler politicos.json' });

    try {
      let data = JSON.parse(raw);

      // Filtros
      const { cargo, estado, partido, nome, page = 1, limit = 20 } = req.query;

      if (cargo) data = data.filter(p => p.cargo.toLowerCase().includes(cargo.toLowerCase()));
      if (estado) data = data.filter(p => p.estado.toLowerCase() === estado.toLowerCase());
      if (partido) data = data.filter(p => p.partido.toLowerCase() === partido.toLowerCase());
      if (nome) data = data.filter(p => p.nome.toLowerCase().includes(nome.toLowerCase()));

      // Paginação
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
    } catch (e) {
      res.status(500).json({ error: 'Arquivo politicos.json inválido' });
    }
  });
});

// GET /api/politicos/:id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile(DATA_FILE, 'utf8', (err, raw) => {
    if (err) return res.status(500).json({ error: 'Não foi possível ler politicos.json' });
    try {
      const data = JSON.parse(raw);
      const item = data.find(p => p.id === id);
      if (!item) return res.status(404).json({ error: 'Político não encontrado' });
      res.json(item);
    } catch (e) {
      res.status(500).json({ error: 'Arquivo politicos.json inválido' });
    }
  });
});

module.exports = router;
