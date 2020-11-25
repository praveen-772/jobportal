const { response } = require('express');
var express = require('express');
var router = express.Router();
const {ADMIN_COLLECTION} = require('../config/collections')
const adminHelpers = require('../helpers/admin-helpers')

/* GET users listing. */
router.get('/',(req, res, next) =>{
    if (req.session.admin){
      res.send(" You are already logged in")
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
      req.session.admin.loggedIn = true
      res.send("Admin Logged In Successfully")
    }
    else{
      req.session.loginErr = response.loginErr;
      res.redirect('/admin')
    }
  })
})

module.exports = router;
