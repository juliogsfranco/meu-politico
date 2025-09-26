const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Rotas
app.use('/api/camara', require('./routes/camara'));
app.use('/api/senado', require('./routes/senado'));
app.use('/api/noticias', require('./routes/noticias'));
app.use('/api/busca', require('./routes/busca'));
app.use('/api/votacoes', require('./routes/votacoes'));

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ API rodando na porta ${PORT}`));
}

module.exports = app;
