var express = require('express')
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const employerHelpers = require('../helpers/employer-helpers')
const JOB_COLLECTION = require('../config/collections');
const { ObjectId } = require('mongodb');
const bodyparser = require('body-parser');
const { resolveContent } = require('nodemailer/lib/shared');
const fileupload = require('express-fileupload')


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
});

router.post('/otp',(req,res)=>{
  req.session.otp_input = req.body.otp_input;
  if(req.session.otp==req.session.otp_input){
    res.render('users/userProfile')
  }
  else{
    loginmsg = "Entered OTP was Wrong -> Please try again to Sign up"
    res.render('users/userSignup',{loginmsg})
    req.session = null;
    loginmsg = null;
  }
});

router.get('/userProfile',(req,res)=>{
  res.render('users/userProfile')
});

router.post('/userProfile',(req,res)=>{
  req.body.userEmail = req.session.userEmail;
  req.body.userName = req.session.userName;
  req.body.userPwd = req.session.userPwd;
  req.body.userMobile = req.session.userMobile;
  req.body.otp = req.session.otp;
  req.body.otp_input = req.session.otp_input;
  req.body.status = "unblocked";
  date = new Date();
  date = date.toISOString().slice(0,10);
  req.body.date = date;
  
  userHelpers.createProfile(req.body,(id)=>{
    let profilePic = req.files.pic;
    let cv = req.files.CV;
    
    profilePic.mv('./public/images/user_profile_pic/'+id+'.jpg',(error,done)=>{
      if(!error){
        console.log("!!!!! Profile Pic Saved !!!!!");
      }
      else{
        console.log("!!!!! Profile Pic Saving Error : "+error);
      }
    })
    cv.mv('./public/jobSeekers_CVs/'+id+'.pdf',(error,done)=>{
      if(!error){
        console.log("!!!!! Profile CV Saved");
      }
      else{
        console.log("Profile CV Saving Error : "+error);
      }
    })
  })
  res.redirect('/')
})

module.exports = router;
