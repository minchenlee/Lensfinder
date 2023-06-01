const pool = require('./mysql').pool;

// 讀取特定 user 過去所有的分析資料
async function getRecordsInfo(userId){
  const promise_pool = pool.promise();
  const SQL = `SELECT * FROM Analysis_Records WHERE user_id = ?;`
  const results = await promise_pool.query(SQL, [userId]);
  return results[0]
};

// 將 user 資料 insert 到 database 中。
async function insertNewRecords( userId, snapshotName, createDate, analysisResult ){
  const promise_pool = pool.promise();
  const SQL = `\
  INSERT INTO Analysis_Records (user_id, snapshot_name, create_date, analysis_result)
  VALUES (?, ?, ?, ?);`;
  insertResult = await promise_pool.query(SQL, [userId, snapshotName, createDate, analysisResult]);
  return insertResult[0];
};

async function deleteRecords( userId, snapshotId ){
  const promise_pool = pool.promise();
  const SQL = `\
  DELETE FROM Analysis_Records WHERE user_id = ? AND id = ?;`;
  deleteResult = await promise_pool.query(SQL, [userId, snapshotId]);
  return deleteResult[0];
};

module.exports = { 
  getRecordsInfo: getRecordsInfo,
  insertNewRecords: insertNewRecords,
  deleteRecords: deleteRecords,
};
