const express = require('express');
const { whetherEmailExists, getUserInfo } = require('../../model/user_model');
const { generateJWT } = require('../account/jwt');
const JWTValidate = require('../account/jwt_validation');
const { getRecordsInfo, insertNewRecords, deleteRecords} = require('../../model/analysis_records_model');

const router = express.Router();

router.get(('/'),
  JWTValidate,
  async function(req, res, next) { 
    try{
      const userId = res.locals.payload.id;
      const result = await getRecordsInfo(userId);

      res.send(result);
      return
    } catch(error) {
      console.error(error);
      res.status(500).send({errorMessage: 'Internal Server Error!'});
    }
});


router.post(('/'), 
  JWTValidate,
  async function(req, res, next) {
    // console.log(req.headers['content-type']);
    console.log(req.body);

    try{
      // 檢查 content-type
      if (req.headers['content-type'] !== 'application/json'){
        res.status(400).send({errorMessage: `request body 格式須為 'application/json'`})
        return
      }

      const userId = res.locals.payload.id;
      const snapshotName = req.body.snapshotName;
      const createDate = req.body.AnalysisDate;
      const analysisResult = JSON.stringify(req.body);
      const result = await insertNewRecords(userId, snapshotName, createDate, analysisResult);

      res.send({message: 'success'});
      return


    } catch(error) {
      console.error(error);
      res.status(500).send({errorMessage: 'Internal Server Error!'});
    }
});


router.delete(('/'),
  JWTValidate,
  async function(req, res, next) {
    try{
      const userId = res.locals.payload.id;
      const snapshotId = req.query.snapshot_id;
      const result = await deleteRecords(userId, snapshotId);

      res.send({message: 'success'});
      return
    }
    catch(error) {
      console.error(error);
      res.status(500).send({errorMessage: 'Internal Server Error!'});
    }
});

module.exports = router;
