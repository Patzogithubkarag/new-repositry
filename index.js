const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

// Replace these with your subaccount API key/secret
const apiKey = 'YWEgBtmjemHbuWNBE3';
const apiSecret = 'KPQ0Cz0J777oClSU6NsLmHiGIEbNjAiLu8fj';
const subAccountId = '497770823'; // the numeric UID of your subaccount

const baseUrl = 'https://api.bybit.com'; // Bybit REST base URL

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Generate signature
function generateSignature(params, secret) {
  const queryString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

// Fetch any DOT futures position for subaccount
async function fetchDOTPosition() {
  const params = {
    api_key: apiKey,
    timestamp: Date.now(),
    accountType: 'UNIFIED',
    category: 'linear', // futures category
    subAccountId: subAccountId,
    settleCoin: "USDT",
  };

  params.sign = generateSignature(params, apiSecret);

  try {
    const response = await axios.get(`${baseUrl}/v5/position/list`, { params });

    if (response.status === 200 && response.data.retCode === 0) {
      // Find any position that has "DOT" in the symbol
      const dotPos = response.data.result.list.find(pos => pos.symbol.includes('DOT'));

      if (!dotPos) {
        throw new Error('DOT position not found');
      }

      return {
        symbol: dotPos.symbol,
        size: dotPos.size,
        avgPrice: parseFloat(dotPos.avgPrice).toFixed(4),
        positionValue: parseFloat(dotPos.positionValue).toFixed(2),
        unrealisedPnl: parseFloat(dotPos.unrealisedPnl).toFixed(4),
        markPrice: parseFloat(dotPos.markPrice).toFixed(4),
        curRealisedPnl: parseFloat(dotPos.curRealisedPnl).toFixed(4),
        liqPrice: parseFloat(dotPos.liqPrice).toFixed(4),
      };
    } else {
      throw new Error(response.data.retMsg);
    }
  } catch (err) {
    console.error('Error fetching data:', err.message);
    return null;
  }
}


// API endpoint
app.get('/api/data', async (req, res) => {
  const data = await fetchDOTPosition();
  if (data) res.json(data);
  else res.status(500).send('Error fetching data');
});

// Render page
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
