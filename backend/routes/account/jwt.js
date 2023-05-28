const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT 生成
function generateJWT(payload){
  const expiresIn = 3600;
  const privateKey = process.env.JWT_PRIVATE_KEY;
  const JWT = jwt.sign(payload, privateKey, {expiresIn: expiresIn})
  return [JWT, expiresIn]
}

module.exports = {
  generateJWT: generateJWT
}