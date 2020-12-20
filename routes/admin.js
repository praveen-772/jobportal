const { response } = require('express');
var express = require('express');
var router = express.Router();
const {ADMIN_COLLECTION} = require('../config/collections')
const adminHelpers = require('../helpers/admin-helpers')
const verifyLogin = (req,res,next)=>{
  if(req.session.admin){
    adminname = req.session.admin
    next();
  }
  else{
    res.redirect('/admin');
  }
}

/* GET users listing. */
router.get('/',(req, res, next) =>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
     if (req.session.admin){
      adminname = req.session.admin
      res.render('admin/Dashboard',adminname)
    }
    else{
      adminHelpers.createAccount(req.body);
      res.render('admin/login',{loginErr:req.session.loginErr});
      req.session.loginErr = null
    }
});

router.post('/',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{

    if(response.status){
      req.session.admin = response.admin
      req.session.loggedIn = true
      res.render('admin/Dashboard',req.body)
    }
    else{
      req.session.loginErr = response.loginErr;
      res.redirect('/admin')
    }
  })
});

router.get('/logout',(req,res)=>{
  req.session.admin = null;
  res.redirect('/admin')
});

router.get('/employers',verifyLogin,(req,res)=>{
  adminHelpers.listEmployers().then((employers)=>{
    adminname = adminname.adminname;
    res.render('admin/employers',{adminname,employers})
  })
});

router.get('/jobseekers',verifyLogin,(req,res)=>{
  res.render('admin/jobseekers',adminname)
});

router.get('/status',verifyLogin,(req,res)=>{
  res.render('admin/status',adminname)
});

router.get('/deleteEmployer/:name',verifyLogin,(req,res)=>{
     adminHelpers.deleteEmployer(req.params).then((response)=>{
     res.redirect('/admin/employers')
  })
})

module.exports = router;