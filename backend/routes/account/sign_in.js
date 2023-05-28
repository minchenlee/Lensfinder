const express = require('express');
const { whetherEmailExists, getUserInfo } = require('../../model/user_model');
const { generateJWT } = require('./jwt');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post(('/'), async function(req, res, next) {
  // console.log(req.headers['content-type']);
  console.log(req.body);

  try{
    // 檢查 content-type
    if (req.headers['content-type'] !== 'application/json'){
      res.status(400).send({errorMessage: `request body 格式須為 'application/json'`})
      return
    }

    // 識別 provider，並驗證 provider
    const provider = req.body.provider;
    if (!(/(native|facebook)/).test(provider)){
      res.status(400).send({errorMessage: 'Unknown provier, please check your provider!'});
      return
    }

    // native
    if (provider === 'native'){
      // user 基本資料獲取
      const email = req.body.email;
      let password = req.body.password;

      // 檢查 email 是否存在
      if (!await whetherEmailExists(email)){
        res.status(400).send({errorMessage: 'email does not exist'})
        return
      }

      // 檢查密碼是否正確
      const userInfo = await getUserInfo(email);
      const passwordHash = userInfo.password;
      const isPasswordValid = await bcrypt.compare(password, passwordHash);
      if (!isPasswordValid){
        res.status(403).send({errorMessage: 'password incorrect'})
        return
      }

      // 將密碼從 user info 中刪除
      delete userInfo.password;

      // 產生 JWT
      let JWT = generateJWT(userInfo);

      // 產生 response
      results = {
        "access_token": JWT[0],
        "access_expired": JWT[1],
      }

      response = {
        'data': results,
      };
  
      res.send(response);
      return
    }

  // facebook
  if (provider === 'facebook'){
  }

  } catch(error) {
    console.error(error);
    res.status(500).send({errorMessage: 'Internal Server Error!'});
  }
});

module.exports = router;
