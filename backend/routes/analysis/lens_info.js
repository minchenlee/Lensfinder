const express = require('express');
const { generateJWT } = require('../account/jwt');
const JWTValidate = require('../account/jwt_validation');
const { getLensInfo } = require('../../model/lens_info_model');

const router = express.Router();

router.get(('/'), async function(req, res, next) {
  console.log(req.query);
  const mount = req.query.mount;
  const type = req.query.type;

  try{
    const result = await getLensInfo(mount, type);
    res.send(result);
    
  } catch(error) {
    console.error(error);
    res.status(500).send({errorMessage: 'Internal Server Error!'});
  }
});

module.exports = router;