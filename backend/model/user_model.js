const pool = require('./mysql').pool;

// 檢查 email 是否已經存在
async function whetherEmailExists(email){
  const promise_pool = pool.promise();
  const SQL = `SELECT COUNT(email) FROM User WHERE email = ?;`
  const results = await promise_pool.query(SQL, [email]);
  const count = await results[0][0]['COUNT(email)']
  
  if (count === 1){
    // console.log('Email Already Exists!');
    return true;
  }
};

// 透過 email 取得 password hash
async function getUserInfo(email){
  const promise_pool = pool.promise();
  const SQL = `SELECT * FROM User WHERE email = ?;`
  const results = await promise_pool.query(SQL, [email]);
  return results[0][0]
};


// 將 user 資料 insert 到 database 中。
async function insertNewUserInfo(email, password, provider){
  const promise_pool = pool.promise();
  const SQL = `\
  INSERT INTO User (email, password, provider) 
  VALUES (?, ?, ?);`;
  insertResult = await promise_pool.query(SQL, [email, password, provider]);
  return insertResult[0];
};

module.exports = { 
  insertNewUserInfo: insertNewUserInfo,
  whetherEmailExists: whetherEmailExists,
  getUserInfo: getUserInfo,
};
