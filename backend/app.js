const politicosRouter = require('./routes/politicos');
const noticiasRouter = require('./routes/noticias');
const buscaRouter = require('./routes/busca');

app.use('/api/politicos', politicosRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/busca', buscaRouter);
