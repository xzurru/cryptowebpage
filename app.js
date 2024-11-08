const apiUrl = 'https://api.coingecko.com/api/v3/simple/price';
const historyApiUrl = 'https://api.coingecko.com/api/v3/coins/';
const coins = [
  'bitcoin', 'ethereum', 'litecoin', 'solana', 'binancecoin', 
  'cardano', 'dogecoin', 'polkadot', 'ripple', 'chainlink'
];

let priceChart;
let language = 'en';

const texts = {
  en: {
    headerTitle: "Crypto Dashboard",
    languageLabel: "Language:",
    currencyLabel: "Currency:",
    calcResult: "Result: ",
    tradeResult: "Profit: "
  },
  de: {
    headerTitle: "Krypto Dashboard",
    languageLabel: "Sprache:",
    currencyLabel: "Währung:",
    calcResult: "Ergebnis: ",
    tradeResult: "Gewinn: "
  }
};

function changeLanguage() {
  language = document.getElementById('languageSelect').value;
  updateTexts();
  getCryptoPrices();
}

function updateTexts() {
  const selectedTexts = texts[language];
  document.getElementById('headerTitle').textContent = selectedTexts.headerTitle;
  document.getElementById('languageLabel').textContent = selectedTexts.languageLabel;
  document.getElementById('currencyLabel').textContent = selectedTexts.currencyLabel;
  document.getElementById('calcResult').textContent = selectedTexts.calcResult;
  document.getElementById('tradeResult').textContent = selectedTexts.tradeResult;
}

async function getCryptoPrices() {
  const currency = document.getElementById('currencySelect').value;

  try {
    const response = await fetch(`${apiUrl}?ids=${coins.join(',')}&vs_currencies=${currency}&include_24hr_change=true`);
    const data = await response.json();

    const cryptoContainer = document.getElementById('crypto-prices');
    cryptoContainer.innerHTML = '';

    for (const coin of coins) {
      const coinData = data[coin];
      if (coinData) {
        const price = coinData[currency];
        const change24h = coinData[`${currency}_24h_change`]?.toFixed(2) || "No data";

        cryptoContainer.innerHTML += `
          <div class="crypto-box" onclick="displayChart('${coin}')">
            <h3>${coin.charAt(0).toUpperCase() + coin.slice(1)}</h3>
            <p>${currency.toUpperCase()} ${price}</p>
            <p>24h Change: ${change24h}%</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function displayChart(coin) {
  const currency = document.getElementById('currencySelect').value;

  try {
    const response = await fetch(`${historyApiUrl}${coin}/market_chart?vs_currency=${currency}&days=7`);
    const data = await response.json();

    const labels = data.prices.map(price => new Date(price[0]).toLocaleDateString());
    const prices = data.prices.map(price => price[1]);

    const highestPrice = Math.max(...prices).toFixed(2);
    const lowestPrice = Math.min(...prices).toFixed(2);

    document.getElementById('highestPrice').textContent = `Highest Price (7 days): ${currency.toUpperCase()} ${highestPrice}`;
    document.getElementById('lowestPrice').textContent = `Lowest Price (7 days): ${currency.toUpperCase()} ${lowestPrice}`;

    if (priceChart) {
      priceChart.destroy();
    }

    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${coin.charAt(0).toUpperCase() + coin.slice(1)} Price (last 7 days)`,
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { display: true, title: { display: true, text: 'Date' } },
          y: { display: true, title: { display: true, text: `Price in ${currency.toUpperCase()}` } }
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching historical data for ${coin}:`, error);
  }
}

async function calculateCrypto() {
  const currency = document.getElementById('currencySelect').value;
  const crypto = document.getElementById('cryptoSelect').value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}?ids=${crypto}&vs_currencies=${currency}`);
    const data = await response.json();
    const price = data[crypto][currency];
    const result = (price * amount).toFixed(2);

    document.getElementById('calcResult').textContent = `Result: ${currency.toUpperCase()} ${result}`;
  } catch (error) {
    console.error("Error calculating crypto:", error);
  }
}

function calculateTradeProfit() {
  const entryPrice = parseFloat(document.getElementById('entryPrice').value);
  const exitPrice = parseFloat(document.getElementById('exitPrice').value);
  const amount = parseFloat(document.getElementById('tradeAmount').value);

  if (!entryPrice || !exitPrice || !amount || entryPrice <= 0 || exitPrice <= 0 || amount <= 0) {
    alert("Please enter valid numbers for all fields.");
    return;
  }

  const profit = ((exitPrice - entryPrice) * amount).toFixed(2);
  document.getElementById('tradeResult').textContent = `Profit: ${profit}`;
}

getCryptoPrices();
setInterval(getCryptoPrices, 60000);
updateTexts();
