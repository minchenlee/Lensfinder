const express = require('express');
const router = express.Router();
const { getDemoRecords } = require('../model/analysis_records_model');


router.get(('/'), async function(req, res, next) {
  const result = await getDemoRecords()
  res.send(result);
  return
});


module.exports = router;
