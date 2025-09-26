const express = require('express');
const router = express.Router();
const axios = require('axios');

const BASE = process.env.SENADO_BASE || 'https://legis.senado.leg.br/dadosabertos';

// GET /api/senado/senadores
router.get('/senadores', async (req, res) => {
  try {
    const url = `${BASE}/senador/lista/atual?format=json`;
    const r = await axios.get(url, { headers: { 'Accept': 'application/json' } });
    res.json(r.data);
  } catch (e) {
    console.error('Erro API Senado:', e.message || e);
    res.status(500).json({ error: 'Falha ao acessar API do Senado' });
  }
});

module.exports = router;
