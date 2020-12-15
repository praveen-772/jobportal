var express = require('express');
var router = express.Router();
var express = require('express')
const userHelpers = require('../helpers/user-helpers')
const JOB_COLLECTION = require('../config/collections');
const { ObjectId } = require('mongodb');
const bodyparser = require('body-parser');


/* GET home page. */
router.get('/', function(req, res, next) {
  userHelpers.allJobs().then((Jobs)=>{
  res.render('users/index',{Jobs});
  })
});

module.exports = router;
