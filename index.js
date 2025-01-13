const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const bodyParser = require('body-parser');
const coinstatsopenapi = '@api/coinstatsopenapi';
const app = express();

const apiKey = '7qrDVFxskTxzsUYf10';
const apiSecret = 'jXTdtshSImrbGNEtaCpXZDoOxuBItGGSOpwN';
const baseUrl = 'https://api.bybit.com/'; // Replace with the actual base URL

app.use(express.urlencoded({ extended: true })); // Parses form data
app.use(express.json()); // Parses JSON data

const coinStatsApiKey = 'UncDF3PrkD77gb8D+KZ9USqnWVhwdPzuHeYjEE8zlrQ=';// extra

// Serve the EJS template
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Generate a signature for the API request
function generateSignature(params, apiSecret) {
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
}


// Define a function to fetch data from the API
async function fetchData() {
  const params = {
    api_key: apiKey,
    timestamp: Date.now(),
    accountType: 'UNIFIED',
    category: 'linear',
    symbol: 'VRAUSDT',
  };

  params.sign = generateSignature(params, apiSecret);


  try {
    const response = await axios.get(`${baseUrl}/v5/position/list`, { params });
    const response2 = await axios.get("https://api.mexc.com/api/v3/ticker/24hr?symbol=VRAUSDT");// extra
    const response3 = await axios.get("https://api.mexc.com/api/v3/ticker/24hr?symbol=DOTUSDT");// extra
    const response4 = await axios.get("https://api.mexc.com/api/v3/ticker/24hr?symbol=AZEROUSDT");// extra
    const response5 = await axios.get("https://api.mexc.com/api/v3/ticker/24hr?symbol=RIOUSDT");// extra

    //const coinstatsResponse = await axios.get('https://openapiv1.coinstats.app/coins', {//extra
     // headers: {//extra
     //   'Authorization': `Bearer ${coinStatsApiKey}`,//extra
     // },//extra
    //});//extra
    //const coinData = coinstatsResponse.data;//extra

    if (response.status === 200 && response.data.retCode === 0) {
      const data = response.data.result.list[0]; // Get the first item from the list
      console.log(JSON.stringify(data, null, 2));
      const value = data.positionValue
   //   const mexcData = {// extra
       // VRAUSDT: response2.data,// extra
      //  DOTUSDT: response3.data,// extra
       // AZEROUSDT: response4.data,// extra
      //  RIOUSDT: response5.data,// extra
    //  };


      
      return {
        symbol: data.symbol,
        leverage: data.leverage,
        size: data.size,
        positionValue: parseFloat(data.positionValue).toFixed(2),
        avgPrice: parseFloat(data.avgPrice).toFixed(6),
        liqPrice: parseFloat(data.liqPrice).toFixed(6),
        positionIM: parseFloat(data.positionIM).toFixed(4),
        positionMM: parseFloat(data.positionMM).toFixed(4),
        markPrice: parseFloat(data.markPrice).toFixed(6),
        unrealisedPnl: parseFloat(data.unrealisedPnl).toFixed(4),
        curRealisedPnl: parseFloat(data.curRealisedPnl).toFixed(4),
       // mexcData: mexcData,// extra
      // coinStats: coinData,//extra
      };
    } else {
      throw new Error(`Error: ${response.data.retMsg}`);
    }
  } catch (error) {
    console.error('Error fetching data from Bybit:', error);
    throw error;
  }
}

// API route to return the data
app.get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data); // Return the data as JSON
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Main route to render the page
app.get("/", (req, res) => {
  res.render('index');
});

app.post('/submit', (req, res) => {
    const inputValue = req.body.inputField;
    console.log(inputValue)
});





app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
