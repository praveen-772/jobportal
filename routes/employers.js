const { response } = require('express');
var express = require('express');
const adminHelpers = require('../helpers/admin-helpers');
const employerHelpers = require('../helpers/employer-helpers');
var router = express.Router();
const verifyLogin = (req,res,next)=>{
  if(req.session.employer){
    next();
  }
  else{
    res.render("employers/login");
  }
}


/* GET users listing. */
router.get('/',function(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if (req.session.employer){
    res.send(" Employer Logged In Successfully.....")
  }
  else{
  res.render('employers/login')
  req.session.loginmsg = null
  }
});

router.post('/',(req,res)=>{
  employerHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.employer = response.employer
      req.session.loggedIn = true
      res.send(" Employer Logged In Successfully.....")
    }
    else{
      req.body.loginmsg = response.loginErr
      res.render('employers/login',req.body)
    }
  })
});

router.get('/empSignup',(req,res)=>{
  res.render('employers/empSignup')
});

router.post('/empSignup',(req,res)=>{
  req.session.email = req.body.empemail
  req.session.username = req.body.empname
  req.session.password = req.body.emppwd
  employerHelpers.createAccount(req.body).then((response)=>{
    if((req.body.info)==="Employer Account Already Exists"){
      res.render('employers/login',{loginmsg:req.body.info});
    }
    else{
      employerHelpers.otpGenerator(req.body).then((response)=>{
        req.session.otp = response.otp
        res.render('employers/otp')
      })
    }
  })
});

router.post('/otp',(req,res)=>{
  req.session.otp_input = req.body.otp_input
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&");
  console.log(req.session);
  if(req.session.otp==req.session.otp_input){
    employerHelpers.otpVerified(req.session).then(()=>{
      res.render('employers/login',{loginmsg:"Employer Registration Completed Successfully"})
    })
  }
  else{
    res.render("employers/login",{loginmsg:"Wrong OTP"})
  }
})

// router.get('/otp',(req,res)=>{
//   employerHelpers.otpGenerator(req.body)
//     res.render('employers/otp')
// })

module.exports = router;
