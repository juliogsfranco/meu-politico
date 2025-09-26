const express = require('express');
const router = express.Router();
const axios = require('axios');

const BASE = process.env.CAMARA_BASE || 'https://dadosabertos.camara.leg.br/api/v2';

// GET /api/camara/deputados
router.get('/deputados', async (req, res) => {
  try {
    const url = `${BASE}/deputados?itens=100&ordem=ASC&ordenarPor=nome`;
    const r = await axios.get(url, { headers: { 'Accept': 'application/json' } });
    res.json(r.data);
  } catch (e) {
    console.error('Erro API Câmara:', e.message || e);
    res.status(500).json({ error: 'Falha ao acessar API da Câmara' });
  }
});

module.exports = router;
