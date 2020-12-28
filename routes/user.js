var express = require('express')
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const JOB_COLLECTION = require('../config/collections');
const { ObjectId } = require('mongodb');
const bodyparser = require('body-parser');
const { resolveContent } = require('nodemailer/lib/shared');


/* GET home page. */
router.get('/', function(req, res, next) {
  userHelpers.allJobs().then((Jobs)=>{
  res.render('users/index',{Jobs});
  })
});

router.get('/login',(req,res)=>{
  res.render('users/login')
});

router.get('/userSignup',(req,res)=>{
  res.render('users/userSignup')
});

router.post('/userSignup',(req,res)=>{
    req.session.userEmail = req.body.userEmail;
    req.session.userName = req.body.userName;
    req.session.userPwd = req.body.userPwd;
    req.session.userMobile = req.body.userMobile;
   userHelpers.createAccount(req.body).then((response)=>{
     if((req.body.info)==="User Account already exists"){
       res.render('users/login',{loginmsg:req.body.info});
     }
     else{
       userHelpers.otpGenerator(req.body).then((otp)=>{
         req.session.otp = otp;
         console.log("OTP Generated");
         console.log(req.session);
        res.render('users/otp')
       })
     }
 })
});

router.get('/otp',(req,res)=>{
  res.redirect('users/otp')
})

router.post('/otp',(req,res)=>{
  req.session.otp_input = req.body.otp_input;
  console.log(req.session);
  res.redirect('/')
})

module.exports = router;
