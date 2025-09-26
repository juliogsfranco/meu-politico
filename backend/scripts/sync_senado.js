require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OUT = path.join(__dirname, '..', 'data', 'politicos.json');
const BASE = process.env.SENADO_BASE || 'https://legis.senado.leg.br/dadosabertos';

(async () => {
  try {
    console.log('Sync Senado: coletando senadores em exercício...');
    const url = `${BASE}/senador/lista/atual?format=json`;
    const r = await axios.get(url, { headers: { 'Accept': 'application/json' } });
    const raiz = r.data;
    const lista = raiz?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar || [];

    const sens = lista.map(p => {
      const id = p?.IdentificacaoParlamentar?.CodigoParlamentar || p?.CodigoParlamentar || '';
      const nome = p?.IdentificacaoParlamentar?.NomeParlamentar || p?.NomeParlamentar || 'Senador';
      const partido = p?.IdentificacaoParlamentar?.SiglaPartidoParlamentar || p?.SiglaPartidoParlamentar || '';
      const uf = p?.IdentificacaoParlamentar?.UfParlamentar || p?.UfParlamentar || '';
      const foto = p?.IdentificacaoParlamentar?.UrlFotoParlamentar || '';
      return {
        id: `sen-${id}`,
        nome,
        partido,
        estado: uf,
        cargo: 'Senador',
        email: '',
        telefone: '',
        redes: {},
        foto,
        biografia: '',
        votacoes: []
      };
    });

    let current = [];
    if (fs.existsSync(OUT)) {
      try { current = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { current = []; }
    }
    const semSens = current.filter(p => !String(p.id).startsWith('sen-'));
    const merged = [...semSens, ...sens];

    fs.writeFileSync(OUT, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`Sync Senado: ${sens.length} senadores salvos (total pós-merge: ${merged.length})`);
  } catch (e) {
    console.error('Erro no sync do Senado:', e.message || e);
    process.exit(1);
  }
})();
