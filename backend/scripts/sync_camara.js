require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OUT = path.join(__dirname, '..', 'data', 'politicos.json');
const BASE = process.env.CAMARA_BASE || 'https://dadosabertos.camara.leg.br/api/v2';

async function fetchPage(url) {
  const r = await axios.get(url, { headers: { 'Accept': 'application/json' } });
  return r.data;
}

(async () => {
  try {
    console.log('Sync Câmara: coletando deputados...');
    let page = 1;
    let all = [];
    while (true) {
      const url = `${BASE}/deputados?itens=100&ordem=ASC&ordenarPor=nome&pagina=${page}`;
      const data = await fetchPage(url);
      const list = data?.dados || [];
      all = all.concat(list);
      const hasNext = (data?.links || []).some(l => l.rel === 'next');
      if (!hasNext || list.length === 0) break;
      page++;
    }

    const deps = all.map(d => ({
      id: `dep-${d.id}`,
      nome: d.nome,
      partido: d.siglaPartido || '',
      estado: d.siglaUf || '',
      cargo: 'Deputado Federal',
      email: d.email || '',
      telefone: '',
      redes: {},
      foto: d.urlFoto || '',
      biografia: '',
      votacoes: []
    }));

    let current = [];
    if (fs.existsSync(OUT)) {
      try { current = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { current = []; }
    }
    const semDeps = current.filter(p => !String(p.id).startsWith('dep-'));
    const merged = [...semDeps, ...deps];

    fs.writeFileSync(OUT, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`Sync Câmara: ${deps.length} deputados salvos (total pós-merge: ${merged.length})`);
  } catch (e) {
    console.error('Erro no sync da Câmara:', e.message || e);
    process.exit(1);
  }
})();
