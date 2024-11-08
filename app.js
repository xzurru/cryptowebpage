const apiUrl = 'https://api.coingecko.com/api/v3/simple/price';
const historyApiUrl = 'https://api.coingecko.com/api/v3/coins/';

// Erweitertes Coin-Array
const coins = [
  'bitcoin', 'ethereum', 'litecoin', 'solana', 'binancecoin', 
  'cardano', 'dogecoin', 'polkadot', 'ripple', 'chainlink'
];

let priceChart;

// Funktion zum Abrufen und Anzeigen der Krypto-Preise
async function getCryptoPrices() {
  const currency = document.getElementById('currencySelect').value;

  try {
    const response = await fetch(`${apiUrl}?ids=${coins.join(',')}&vs_currencies=${currency}&include_24hr_change=true`);
    const data = await response.json();

    const cryptoContainer = document.getElementById('crypto-prices');
    cryptoContainer.innerHTML = ''; // Clear previous data

    for (const coin of coins) {
      const coinData = data[coin];
      if (coinData) {
        const price = coinData[currency];
        const change24h = coinData[`${currency}_24h_change`]?.toFixed(2) || "Keine Daten";

        cryptoContainer.innerHTML += `
          <div class="crypto-box" onclick="displayChart('${coin}')">
            <h3>${coin.charAt(0).toUpperCase() + coin.slice(1)}</h3>
            <p>Preis: ${currency.toUpperCase()} ${price}</p>
            <p>24h Änderung: ${change24h}%</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
  }
}

// Funktion zur Anzeige des Diagramms für eine Kryptowährung
async function displayChart(coin) {
  const currency = document.getElementById('currencySelect').value;

  try {
    const response = await fetch(`${historyApiUrl}${coin}/market_chart?vs_currency=${currency}&days=7`);
    const data = await response.json();

    const labels = data.prices.map(price => new Date(price[0]).toLocaleDateString());
    const prices = data.prices.map(price => price[1]);

    if (priceChart) {
      priceChart.destroy();
    }

    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${coin.charAt(0).toUpperCase() + coin.slice(1)} Preis (letzte 7 Tage)`,
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { display: true, title: { display: true, text: 'Datum' } },
          y: { display: true, title: { display: true, text: `Preis in ${currency.toUpperCase()}` } }
        }
      }
    });
  } catch (error) {
    console.error(`Fehler beim Abrufen der historischen Daten für ${coin}:`, error);
  }
}

// Währungsrechner-Funktion bleibt unverändert.
async function calculateCrypto() {
  const crypto = document.getElementById('cryptoSelect').value;
  const amount = document.getElementById('amount').value;
  const currency = document.getElementById('currencySelect').value;

  try {
    const response = await fetch(`${apiUrl}?ids=${crypto}&vs_currencies=${currency}`);
    const data = await response.json();
    const price = data[crypto][currency];

    const result = amount * price;
    document.getElementById('result').textContent = `Ergebnis: ${result.toFixed(2)} ${currency.toUpperCase()}`;
  } catch (error) {
    console.error("Fehler bei der Berechnung:", error);
    document.getElementById('result').textContent = "Fehler bei der Berechnung.";
  }
}

// Gewinnrechner-Funktionen für Long- und Short-Trades bleiben unverändert
function calculateLongTrade() {
  const entryPrice = parseFloat(document.getElementById('entryPrice').value);
  const exitPrice = parseFloat(document.getElementById('exitPrice').value);
  const positionSize = parseFloat(document.getElementById('positionSize').value);
  const profit = (exitPrice - entryPrice) * positionSize;
  document.getElementById('tradeResult').textContent = `Long Trade Gewinn: ${profit.toFixed(2)}`;
}

function calculateShortTrade() {
  const entryPrice = parseFloat(document.getElementById('entryPrice').value);
  const exitPrice = parseFloat(document.getElementById('exitPrice').value);
  const positionSize = parseFloat(document.getElementById('positionSize').value);
  const profit = (entryPrice - exitPrice) * positionSize;
  document.getElementById('tradeResult').textContent = `Short Trade Gewinn: ${profit.toFixed(2)}`;
}

getCryptoPrices();
setInterval(getCryptoPrices, 60000); // Aktualisiert alle 60 Sekunden
