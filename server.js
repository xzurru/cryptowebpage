// server.js
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());
const coins = ['bitcoin', 'ethereum', 'litecoin', 'solana', 'binancecoin', 'cardano', 'dogecoin', 'polkadot', 'ripple', 'chainlink'];
const apiUrl = 'https://api.coingecko.com/api/v3';

app.get('/api/crypto-prices', async (req, res) => {
  const currency = req.query.currency || 'usd';
  try {
    const response = await fetch(`${apiUrl}/simple/price?ids=${coins.join(',')}&vs_currencies=${currency}&include_24hr_change=true`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Fehler beim Abrufen der Preisdaten:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Preisdaten" });
  }
});

app.get('/api/crypto-history/:coin', async (req, res) => {
  const { coin } = req.params;
  const currency = req.query.currency || 'usd';

  try {
    const response = await fetch(`${apiUrl}/coins/${coin}/market_chart?vs_currency=${currency}&days=7`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Fehler beim Abrufen der historischen Daten für ${coin}:`, error);
    res.status(500).json({ error: `Fehler beim Abrufen der historischen Daten für ${coin}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft unter http://localhost:${PORT}`);
});
