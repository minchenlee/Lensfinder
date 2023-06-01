const express = require('express');
const { getExchangeRate, getAvaliableCurrencyCode } = require('../model/currency_exchange_rate_model');

const router = express.Router();

router.get(('/'), async function(req, res, next) {
  try{
    const result = await getExchangeRate();
    if (!result){
      res.status(400).send({errorMessage: 'currency code not found'});
      return
    }
    res.send(result);
    
  } catch(error) {
    console.error(error);
    res.status(500).send({errorMessage: 'Internal Server Error!'});
  }
});

router.get('/avaliableCurrency', async function(req, res, next) {
  try{
    const result = await getAvaliableCurrencyCode();
    const currencyCode = result.map((item) => item.currency_code);
    res.send(currencyCode);
    
  }
  catch(error) {
    console.error(error);
    res.status(500).send({errorMessage: 'Internal Server Error!'});
  }
});

module.exports = router;
