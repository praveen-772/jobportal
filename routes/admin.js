var express = require('express');
var router = express.Router();
const {ADMIN_COLLECTION} = require('../config/collections')
const adminHelpers = require('../helpers/admin-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
    if (req.session.admin){
      res.send(" You are already logged in")
    }
    else{
      adminHelpers.createAccount(req.body);
      res.render('admin/login');
    }
});

module.exports = router;
