const axios = require('axios');

async function safeGet(url, opts = {}) {
  try {
    const res = await axios.get(url, opts);
    return res.data;
  } catch (e) {
    console.error('Erro fetch:', url, e.message || e);
    return null;
  }
}

module.exports = { safeGet };
