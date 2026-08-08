const axios = require('axios');

/**
 * Función para mantener el backend de Render despierto.
 * Se auto-llama cada 14 minutos.
 */
const setupAutoPing = () => {
  const URL = process.env.AUTO_PING_URL; // o url del nuevo baken en render
  const INTERVAL = 14 * 60 * 1000; // 14 minutos

  console.log('[Auto-Ping] Persistence system initialized.');

  setInterval(async () => {
    try {
      const response = await axios.get(URL);
      console.log(`[Auto-Ping] Successful ping: ${response.data} (${new Date().toLocaleTimeString()})`);
    } catch (error) {
      console.error('[Auto-Ping] Auto-ping failure:', error.message);
    }
  }, INTERVAL);
};

module.exports = setupAutoPing;