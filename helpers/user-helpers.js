var db = require('../config/connections')
var collection = require('../config/collections')
var fs = require('fs');
// var request = require('request');
// var springedge = require('springedge');

const bcrypt = require('bcrypt')
const bodyparser = require('body-parser')

module.exports = {
    allJobs: () => {
        return new Promise(async (resolve, reject) => {
            status = "unblocked"
            let jobs = await db.get().collection(collection.JOB_COLLECTION).find({ 'status': status }).toArray();
            resolve(jobs)
        })
    },
    createAccount: (userData) => {
        return new Promise(async (resolve, reject) => {
            let userCheck = await db.get().collection(collection.USER_COLLECTION).findOne({ 'userEmail': userData.userEmail })
            if (userCheck) {
                userData.info = "User Account already exists";
                resolve(userData)
            }
            else {

            }
            resolve()
        })
    },
    otpGenerator: (userData) => {
        return new Promise(async (resolve, reject) => {
            var messagebird = require('messagebird')('JETcDkYiCOfgwJ0XVq6XDD3EC')
            var otp = Math.random();
            var mobile = userData.userMobile;
            otp = otp * 1000000;
            otp = parseInt(otp);
            console.log(mobile);
            console.log(otp);

            await messagebird.messages.create({
                originator: +971563068466,
                recipients: mobile,
                body: otp
            },
                function (err, response) {
                    if (err) {
                        console.log("!!! Message Bird SMS Sending ERROR: !!!");
                        console.log(err);
                    } else {
                        console.log("!!! Message Bird SMS Sending SUCCESS: !!!");
                        // console.log(response);
                        // console.log("++++++++++++++++++++++++++");
                    }
                });
            resolve(otp);
        })
    },
    createProfile: (userDetails,userID_Return) => {
        return new Promise(async (resolve, reject) => {
            userDetails.userPwd = await bcrypt.hash(userDetails.userPwd, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then((data) => {
                console.log("!!!!! User Credentials Created in Database !!!!!");
                // console.log(data);
                // userID_Return(data.ops[0]._id);
                userID_Return(data.ops[0]._id);
            })
        })
    }
}