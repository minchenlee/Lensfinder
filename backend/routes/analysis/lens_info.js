const express = require('express');
const { generateJWT } = require('../account/jwt');
const JWTValidate = require('../account/jwt_validation');
const { getLensInfo } = require('../../model/lens_info_model');

const router = express.Router();


router.get(('/'), async function(req, res, next) {
  const mount = req.query.mount;
  try{
    const result = await getLensInfo(mount);
    res.send(result);
    
  } catch(error) {
    console.error(error);
    res.status(500).send({errorMessage: 'Internal Server Error!'});
  }
});

module.exports = router;