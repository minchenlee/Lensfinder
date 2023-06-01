const pool = require('./mysql').pool;

// 讀取特定 user 過去所有的分析資料
async function getLensInfo(mount){
  const promise_pool = pool.promise();
  const SQL = `SELECT * FROM Lens WHERE mount = ?;`
  const results = await promise_pool.query(SQL, [mount]);
  return results[0]
};


module.exports = {
  getLensInfo: getLensInfo,
};