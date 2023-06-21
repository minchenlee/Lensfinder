const pool = require('./mysql').pool;

// 讀取特定 mount 鏡頭的資訊
async function getLensInfo(mount, type){
  const promise_pool = pool.promise();
  const SQL = `SELECT * FROM Lens WHERE mount = ? AND type = ?;`
  const results = await promise_pool.query(SQL, [mount, type]);
  return results[0]
};


module.exports = {
  getLensInfo: getLensInfo,
};