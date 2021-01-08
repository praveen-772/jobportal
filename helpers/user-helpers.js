var db = require('../config/connections')
var collection = require('../config/collections')
var fs = require('fs');
// var request = require('request');
// var springedge = require('springedge');

const bcrypt = require('bcrypt')
const bodyparser = require('body-parser');
const { resolve } = require('path');
const { ObjectId } = require('mongodb');
const { response } = require('express');
const { info } = require('console');

module.exports = {
    allJobs: (user) => {
        return new Promise(async (resolve, reject) => {
            status = "unblocked"
            let jobs = await db.get().collection(collection.JOB_COLLECTION).find({ 'status': status }).toArray();
            if (user) {
                let users = await db.get().collection(collection.USER_COLLECTION).findOne({ 'fullName': user })
                console.log(jobs[0]._id);
                console.log(users.appliedjobId[0]);
                console.log(jobs.length);
                console.log(users.appliedjobId.length);
                
             
                // for (i = 0; i < jobs.length; i++) {
                //     for (j = 0; j < users.appliedjobId.length; j++) {
                //         if (ObjectId(jobs[i]._id) === ObjectId(users.appliedjobId[j])) {
                //             console.log("Hai");
                //         }
                //     }
                // }
            }
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
            var messagebird = require('messagebird')('vyHnAFa64CZvPZjytD0lrxj2a')
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
    createProfile: (userDetails, userID_Return) => {
        return new Promise(async (resolve, reject) => {
            userDetails.userPwd = await bcrypt.hash(userDetails.userPwd, 10)
            userDetails.appliedjobId = []
            db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then((data) => {
                console.log("!!!!! User Credentials Created in Database !!!!!");
                // console.log(data);
                // userID_Return(data.ops[0]._id);
                userID_Return(data.ops[0]._id);
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let userVerify = await db.get().collection(collection.USER_COLLECTION).findOne({ userEmail: userData.userEmail })
            if (userVerify) {
                bcrypt.compare(userData.userPwd, userVerify.userPwd).then((status) => {
                    if (status) {
                        if (userVerify.status == "unblocked") {
                            console.log("User Login Success Verified from Database");
                            response.user = userVerify.fullName;
                            response.status = true;
                            resolve(response)
                        }
                        else {
                            loginmsg = "!!! Your Account is BLOCKED !!! => Plz Contact Admin";
                            response.status = false;
                            resolve({ status: false, loginmsg })
                        }
                    }
                    else {
                        loginmsg = "Login Failed => Wrong Password"
                        response.status = false
                        resolve({ status: false, loginmsg })
                    }
                })
            }
            else {
                loginmsg = "Login Failed => Wrong Username / No Account Exists"
                response.status = false
                resolve({ status: false, loginmsg })
            }
        })
    },
    viewProfile: (user) => {
        return new Promise(async (resolve, reject) => {
            let userDetails = await db.get().collection(collection.USER_COLLECTION).find({ 'fullName': user }).toArray();
            resolve(userDetails)
        })
    },
    editProfile: (id) => {
        return new Promise(async (resolve, reject) => {
            let userDetails = await db.get().collection(collection.USER_COLLECTION).findOne({ '_id': ObjectId(id) })
            resolve(userDetails)
        })
    },
    updateProfile: (id, userDetails) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(id) },
                {
                    $set: {
                        nationality: userDetails.nationality,
                        dob: userDetails.dob,
                        qualification: userDetails.qualification,
                        careerLevel: userDetails.careerLevel,
                        currentLocation: userDetails.currentLocation,
                        currentPosition: userDetails.currentPosition,
                        CurrentCompany: userDetails.CurrentCompany,
                        salaryExpectation: userDetails.salaryExpectation,
                        commitment: userDetails.commitment,
                        noticePeriod: userDetails.noticePeriod
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    findJob: (id) => {
        return new Promise(async (resolve, reject) => {
            let job = await db.get().collection(collection.JOB_COLLECTION).findOne({ _id: ObjectId(id) });
            resolve(job);
        })
    },
    applyJob: (jobId, user) => {
        return new Promise(async (resolve, reject) => {
            let appliedJobs = await db.get().collection(collection.USER_COLLECTION).findOne({ 'fullName': user });
            console.log(appliedJobs);
            let info = null
            notapplied = true;
            let jobLength = appliedJobs.appliedjobId.length;
            for (i = 0; i < jobLength; i++) {
                if ((appliedJobs.appliedjobId[i]) == jobId) {
                    info = "This Job already applied"
                    notapplied = false;
                    resolve(info);
                }
                else {
                    notapplied = true;
                }
            }
            if (notapplied) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ 'fullName': user },
                    {
                        $push: {
                            appliedjobId: ObjectId(jobId)
                        }
                    }).then(() => {
                        info = "Your profile forwarded to employer"
                        resolve(info)
                    })
            }
        })
    },
    viewJob:()=>{
        return new Promise(async(resolve,reject)=>{
            let jobs = await db.get().collection(collection.JOB_COLLECTION).find({status:"unblocked"}).toArray();
            resolve(jobs)
        })
    }
}