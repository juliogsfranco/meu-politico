require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OUT = path.join(__dirname, '..', 'data', 'noticias.json');
const KEY = process.env.GNEWS_KEY || '752f1805baa9021aa2bc07a937b2b274';

(async () => {
  if (!KEY) {
    console.error('Chave GNEWS_KEY não configurada no .env');
    process.exit(1);
  }

  console.log('Sync News (GNews): buscando notícias...');

  const url = `https://gnews.io/api/v4/search?q=deputado%20OR%20senador%20OR%20congresso&lang=pt&country=br&max=50&token=${KEY}`;

  try {
    const r = await axios.get(url);
    const items = (r.data.articles || []).map((a, i) => ({
      id: `n-${Date.now()}-${i}`,
      titulo: a.title,
      fonte: a.source?.name || '',
      data: a.publishedAt,
      link: a.url
    }));
    fs.writeFileSync(OUT, JSON.stringify(items, null, 2), 'utf8');
    console.log(`Sync News: salvo ${items.length} notícias em ${OUT}`);
  } catch (e) {
    console.error('Erro ao buscar notícias da GNews:', e.message || e);
    process.exit(1);
  }
})();
