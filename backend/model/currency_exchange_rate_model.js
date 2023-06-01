const pool = require('./mysql').pool;

// 讀取特定 user 過去所有的分析資料
async function getExchangeRate(){
  // the base currency is USD
  const promise_pool = pool.promise();
  const SQL = `SELECT * FROM Exchange_Rates;`
  const results = await promise_pool.query(SQL);

  // 如果沒有找到資料，就 call 外部 API 取得 currency exchange rate
  let exchangeRateRawData; // 存放外部 API 回傳的資料
  let exchanegeRateDict; // 存放外部 API 整理過後的資料
  let exchangeRateInfo;
  let updateResult; // 存放更新資料的結果
  let createResult;  // 存放重新建立資料的結果

  // Exchange_Rates table 中有資料，檢查是否需要更新
  if (results[0].length !== 0){
    exchangeRateInfo = results[0]
  }

  if (exchangeRateInfo !== undefined){
    // 檢查是否需要更新
    const updateTime = new Date(exchangeRateInfo[0].update_time);
    const now = new Date();
    const diffTime = now.getTime() - updateTime.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    // 如果距離上次更新超過 1 天，就 call 外部 API 更新資料
    if (diffDays > 1){
      try {
        // call 外部 API 取得 currency exchange rate
        exchangeRateRawData = await fetch('https://v6.exchangerate-api.com/v6/65c3f637486e10ef4f081a1d/latest/USD')
        exchanegeRateDict = await exchangeRateRawData.json();
        exchanegeRateDict = exchanegeRateDict.conversion_rates;

        // 將資料存入 database，並加上時間戳記
        for (let key in exchanegeRateDict){
          const SQL = `\
          UPDATE Exchange_Rates SET exchange_rate = ?, update_time = ? WHERE currency_code = ?;`;
          updateResult = await promise_pool.query(SQL, [exchanegeRateDict[key], new Date(), key]);
        }

      } catch (error) {
        console.log(error);
        return false;
      }

      return exchangeRateInfo
    }
  }


  // Exchange_Rates table 中沒有資料，就 call 外部 API 取得 currency exchange rate
  if (exchangeRateInfo === undefined){
    try {
      exchangeRateRawData = await fetch('https://v6.exchangerate-api.com/v6/65c3f637486e10ef4f081a1d/latest/USD')

      exchanegeRateDict = await exchangeRateRawData.json();
      exchanegeRateDict = exchanegeRateDict.conversion_rates;
  
      // 將資料存入 database，並加上時間戳記
      for (let key in exchanegeRateDict){
        const SQL = `\
        INSERT INTO Exchange_Rates (currency_code, exchange_rate, update_time)
        VALUES (?, ?, ?);`;
        createResult = await promise_pool.query(SQL, [key, exchanegeRateDict[key], new Date()]);
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  return exchangeRateInfo;
};



async function getAvaliableCurrencyCode(){
  const promise_pool = pool.promise();
  const SQL = `SELECT currency_code FROM Exchange_Rates;`
  const results = await promise_pool.query(SQL);
  return results[0];
}


module.exports = {
  getExchangeRate: getExchangeRate,
  getAvaliableCurrencyCode: getAvaliableCurrencyCode
};
