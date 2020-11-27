const { response } = require('express');
var express = require('express');
var router = express.Router();
const {ADMIN_COLLECTION} = require('../config/collections')
const adminHelpers = require('../helpers/admin-helpers')

/* GET users listing. */
router.get('/',(req, res, next) =>{
    if (req.session.admin){
      let adminname = req.session.admin
      res.render('admin/adminPanel',adminname)
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
      res.render('admin/adminPanel',req.body)
    }
    else{
      req.session.loginErr = response.loginErr;
      res.redirect('/admin')
    }
  })
});

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/admin')
});


module.exports = router;