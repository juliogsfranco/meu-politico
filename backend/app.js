const express = require('express');
const cors = require('cors');
const path = require('path');

// Cria o app Express
const app = express();

// Middleware de CORS
app.use(cors());

// Rotas
const politicosRouter = require('./routes/politicos');
const noticiasRouter = require('./routes/noticias');
const buscaRouter = require('./routes/busca');

app.use('/api/politicos', politicosRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/busca', buscaRouter);

// Exporta para ser usado pelo server.js ou diretamente
module.exports = app;

// Se rodar diretamente (ex: `node app.js`)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ API rodando na porta ${PORT}`);
  });
}
