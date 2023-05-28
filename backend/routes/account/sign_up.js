const express = require('express');
const { whetherEmailExists, getUserInfo, insertNewUserInfo} = require('../../model/user_model');
const { UserInfovalidCheck } = require('./format_check');
const { generateJWT } = require('./jwt');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post(('/'), async function(req, res, next) {
  // console.log(req.headers['content-type']);

  try{
    // 檢查 content-type
    if (req.headers['content-type'] !== 'application/json'){
      res.status(400).send({errorMessage: `request body 格式須為 'application/json'`})
      return
    }

    console.log(req.body)

    // user 基本資料獲取
    const email = req.body.email;
    let password = req.body.password
    const provider = 'native';

    // 檢查 email 是否重複
    if (await whetherEmailExists(email)){
      res.status(409).send({errorMessage: 'email already exists'})
      return
    }

    // 檢查 userName, email, password 格式是否正確
    const checkResult = UserInfovalidCheck(email, password);
    const isNotValid = checkResult[0];
    const checkMessage = checkResult[1];
    if (isNotValid){
      res.status(400).send(checkMessage);
      return
    }

    // 檢查完將密碼加密
    password = await bcrypt.hash(password, 10);

    // 將 user 資料 insert 到 database 中。
    const insertResult = await insertNewUserInfo(email, password, provider);

    // 彙整 user info
    const id = insertResult.insertId;  // 取得 user 於 DB 中的 id
    const userInfo = {
      "id": id,
      "email": email,
      "provider": provider,
    }

    // 產生 JWT
    let JWT = generateJWT(userInfo);

    // 製作 response
    results = {
      "access_token": JWT[0],
      "access_expired": JWT[1],
    }

    response = {
      'data': results,
    };

    res.send(response);

  } catch(error) {
    console.error(error);
    res.status(500).send({errorMessage: 'Internal Server Error!'});
  }
});

module.exports = router;