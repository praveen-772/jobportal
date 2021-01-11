var express = require('express')
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const employerHelpers = require('../helpers/employer-helpers')
const JOB_COLLECTION = require('../config/collections');
const { ObjectId } = require('mongodb');
const bodyparser = require('body-parser');
const { resolveContent } = require('nodemailer/lib/shared');
const fileupload = require('express-fileupload');
const { response } = require('express');
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    user = req.session.user
    next();
  }
  else {
    res.render("users/login");
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if (req.session.user) {
    user = req.session.user;
    userHelpers.allJobs(user).then((Jobs) => {
      res.render('users/Dashboard', { user, Jobs })
    })
  }
  else {
    userHelpers.allJobs().then((Jobs) => {
      res.render('users/index', { Jobs });
    })
  }
});

router.get('/login', (req, res) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if (req.session.user) {
    user = req.session.user;
    userHelpers.allJobs(user).then((Jobs) => {
      res.render('users/Dashboard', { user, Jobs })
    })
  }
  else {
    res.render('users/login')
  }
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.user = response.user;
      req.session.loggedIn = true;
      user = req.session.user;
      userHelpers.allJobs(user).then((Jobs) => {
        res.render('users/Dashboard', { user, Jobs })
      })
    }
    else {
      req.body.loginmsg = response.loginmsg;
      req.body.userName = null;
      req.session.user = null;
      res.render('users/login', req.body)
    }
  })
});

router.get('/userSignup', (req, res) => {
  res.render('users/userSignup')
});

router.post('/userSignup', (req, res) => {
  req.session.userEmail = req.body.userEmail;
  req.session.userName = req.body.userName;
  req.session.userPwd = req.body.userPwd;
  req.session.userMobile = req.body.userMobile;
  userHelpers.createAccount(req.body).then((response) => {
    if ((req.body.info) === "User Account already exists") {
      res.render('users/login', { loginmsg: req.body.info });
    }
    else {
      userHelpers.otpGenerator(req.body).then((otp) => {
        req.session.otp = otp;
        console.log("OTP Generated");
        console.log(req.session);
        res.render('users/otp')
      })
    }
  })
});

router.get('/otp', (req, res) => {
  res.redirect('users/otp')
});

router.post('/otp', (req, res) => {
  req.session.otp_input = req.body.otp_input;
  if (req.session.otp == req.session.otp_input) {
    res.render('users/userProfile')
  }
  else {
    loginmsg = "Entered OTP was Wrong -> Please try again to Sign up"
    res.render('users/userSignup', { loginmsg })
    req.session = null;
    loginmsg = null;
  }
});

router.get('/userProfile', (req, res) => {
  res.render('users/userProfile')
});

router.post('/userProfile', (req, res) => {
  req.body.userEmail = req.session.userEmail;
  req.body.userName = req.session.userName;
  req.body.userPwd = req.session.userPwd;
  req.body.userMobile = req.session.userMobile;
  req.body.otp = req.session.otp;
  req.body.otp_input = req.session.otp_input;
  req.body.status = "unblocked";
  date = new Date();
  date = date.toISOString().slice(0, 10);
  req.body.date = date;

  userHelpers.createProfile(req.body, (id) => {
    let profilePic = req.files.pic;
    let cv = req.files.CV;

    profilePic.mv('./public/images/user_profile_pic/' + id + '.jpg', (error, done) => {
      if (!error) {
        console.log("!!!!! Profile Pic Saved !!!!!");
      }
      else {
        console.log("!!!!! Profile Pic Saving Error : " + error);
      }
    })
    cv.mv('./public/jobSeekers_CVs/' + id + '.pdf', (error, done) => {
      if (!error) {
        console.log("!!!!! Profile CV Saved");
      }
      else {
        console.log("Profile CV Saving Error : " + error);
      }
    })
  })
  res.redirect('/')
});


router.get('/logout', (req, res) => {
  req.session.user = null
  loginmsg = "!!! User Logged Out Successfully !!!"
  res.render('users/login', { loginmsg })
});

router.get('/Dashboard', verifyLogin, (req, res) => {
  userHelpers.allJobs(user).then((Jobs) => {
    res.render('users/Dashboard', { user, Jobs})
  })
});

router.get('/viewProfile', verifyLogin, (req, res) => {
  userHelpers.viewProfile(user).then((userDetails) => {
    res.render('users/viewProfile', { user, userDetails })
  })
});

router.get('/editProfile/:id', verifyLogin, (req, res) => {
  userHelpers.editProfile(req.params.id).then((userDetails) => {
    console.log(userDetails);
    res.render('users/editProfile',{userDetails,user})
  })
});

router.post('/editProfile/:id',verifyLogin,(req,res)=>{
  id = req.params.id;
  userDetails = req.body;
  profileCV = req.files.CV;
  profilePic = req.files.pic;
  userHelpers.updateProfile(id,userDetails).then(()=>{
    if(profileCV){
      profileCV.mv('./public/jobSeekers_CVs/'+id+'.pdf')
    }
    if(profilePic){
      profilePic.mv('./public/images/user_profile_pic/'+id+'.jpg')
    }
    res.redirect('/viewProfile')
  })
});
router.get('/jobDetails/:id',verifyLogin,(req,res)=>{
  id = req.params.id;
  userHelpers.findJob(id).then((job)=>{
    console.log(job);
    res.render('users/jobDetails',{user,job})
  })
});

router.get('/applyJob/:jobId',verifyLogin,(req,res)=>{
  jobId = req.params.jobId;
  userHelpers.applyJob(jobId,user).then((info)=>{
    res.render('users/Dashboard',{user,info})
    info = null;
  })
});

router.get('/findJob',verifyLogin,(req,res)=>{
  userHelpers.viewJob().then((jobs)=>{
    res.render('users/findJob',{user,jobs})
  })
});

router.get('/viewAppliedJobs/:name',verifyLogin,(req,res)=>{
  userHelpers.viewAppliedJobs(req.params.name).then((viewAppliedJobs)=>{
    console.log(viewAppliedJobs);
    res.render('employers/viewAppliedJobs',{user,viewAppliedJobs})
  })
})

module.exports = router;
