const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Libera o acesso do seu site (pode restringir depois)
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

// Rotas da API
const politicosRouter = require('./routes/politicos');
const noticiasRouter = require('./routes/noticias');
const buscaRouter = require('./routes/busca');

app.use('/api/politicos', politicosRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/busca', buscaRouter);

// Sobe o servidor quando executado diretamente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ API rodando na porta ${PORT}`);
  });
}

module.exports = app;
