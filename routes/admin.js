const { response } = require('express');
var express = require('express');
var router = express.Router();
const {ADMIN_COLLECTION} = require('../config/collections')
const adminHelpers = require('../helpers/admin-helpers')

/* GET users listing. */
router.get('/',(req, res, next) =>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
     if (req.session.admin){
      let adminname = req.session.admin
      res.render('admin/Dashboard',req.session.admin)
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

router.get('/employers',(req,res)=>{
res.render('admin/employers',req.session.admin)
})

router.get('/jobseekers',(req,res)=>{
  res.render('admin/jobseekers',req.session.admin)
})

router.get('/status',(req,res)=>{
  res.render('admin/status',req.session.admin)
})

module.exports = router;