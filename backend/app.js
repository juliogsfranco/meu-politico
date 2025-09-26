const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Rotas
const politicosRouter = require('./routes/politicos');
const noticiasRouter = require('./routes/noticias');
const buscaRouter = require('./routes/busca');

app.use('/api/politicos', politicosRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/busca', buscaRouter);

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ API rodando na porta ${PORT}`));
}

module.exports = app;
