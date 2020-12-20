const { response } = require('express');
var express = require('express');
const adminHelpers = require('../helpers/admin-helpers');
const employerHelpers = require('../helpers/employer-helpers');
const bodyparser = require('body-parser');
const { ObjectId } = require('mongodb');
var router = express.Router();
var date;
var empname;
const verifyLogin = (req,res,next)=>{
  if(req.session.employer){
    empname = req.session.employer
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
    empname = req.session.employer
    res.render('employers/Dashboard',empname)
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
      empname = req.session.employer
      res.render('employers/Dashboard',empname)
    }
    else{
      req.body.loginmsg = response.loginErr
      req.body.empname = null
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
});

router.get('/postJob',verifyLogin,(req,res)=>{
  res.render('employers/postJob',empname)
});

router.post('/postJob',(req,res)=>{
  req.body.empname = empname.empname;
  id = empname._id;
  date = new Date();
  date = date.toISOString().slice(0,10);
  req.body.date = date;
  // console.log("---------------------------");
  // console.log(req.body);
  // console.log("---------------------------");
  // console.log(req.files.logoFile);
  
  employerHelpers.postJob(req.body,(id)=>{
    let logo = req.files.logoFile;
    logo.mv('./public/images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('employers/Dashboard',empname)
      }
      else{
        console.log(err);
      }
    })

  })
  res.render('employers/Dashboard',empname)
});

router.get('/postedJobs',verifyLogin,(req,res)=>{
  empname = empname.empname;
  employerHelpers.postedjobs(empname).then((jobs)=>{
    console.log(jobs);
    res.render('employers/postedJobs',{jobs,empname})
  })
});

router.get('/logout',(req,res)=>{
  req.session.employer = null;
  res.render('employers/login',{loginmsg:"Employer Account Logged Out Successfully"})
});

router.get('/deleteJob/',verifyLogin,(req,res)=>{
  jobID = req.query.id;
  console.log(jobID);
  employerHelpers.deleteJob(jobID).then(()=>{
    res.redirect('/employers/postedJobs')
  })
})


module.exports = router;
