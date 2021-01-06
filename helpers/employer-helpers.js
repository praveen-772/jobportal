var db = require('../config/connections')
var collection = require('../config/collections')
var fs = require('fs');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const bodyparser = require('body-parser');
const { ObjectId } = require('mongodb');
const { response } = require('express');
const { resolve } = require('path');


module.exports={
    createAccount:(empData)=>{
        return new Promise(async(resolve, reject)=>{
            let empCheck = await db.get().collection(collection.EMPLOYER_COLLECTION).findOne({empname:empData.empname})
            if (empCheck){
                empData.info = "Employer Account Already Exists"
                resolve(empData)
            }
            else{
                    // empData.info = "Employer Account Created"
                //     db.get().collection(collection.EMPLOYER_COLLECTION).insertOne(empData).then((data)=>{
                //     resolve(data.ops[0])
                // })
            }resolve()
        })
    },
    doLogin:(empData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response={}
            let empVerify = await db.get().collection(collection.EMPLOYER_COLLECTION).findOne({empname:empData.empname})
            if (empVerify){
                bcrypt.compare(empData.emppwd,empVerify.emppwd).then((status)=>{
                    if (status){
                        console.log(empVerify.status);
                        if (empVerify.status=="unblocked"){
                            console.log("Employer Login Success Verified from Database");
                            response.employer = empVerify
                            response.status = true
                            resolve(response)
                        }
                        else{
                            loginErr = "!!! Your Account is BLOCKED !!! => Plz Contact Admin"
                            response.status = false
                            resolve({status:false,loginErr})
                        }
                    }
                    else{
                        loginErr = "Login Failed => Wrong Password"
                        response.status = false
                        resolve({status: false,loginErr})
                    }
                })
            }
            else{
                loginErr = "Login Failed => Wrong Username"
                response.status = false
                resolve({status:false,loginErr})
            }
        })
    },
    otpGenerator:(empData)=>{
        return new Promise((resolve,reject)=>{
        var otp = Math.random();
        var email = empData.empemail;
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port:465,
            secure:true,
            service:'Gmail',
            auth:{
                user:'praveennair772@gmail.com',
                pass:'wprhvydmpgfmexni'
            }
        });
        
        otp = otp * 1000000;
        otp = parseInt(otp)
        console.log(" NEW OTP Generated");
        console.log(otp);
        empData.otp = otp;

        var mailOptions ={
            to:email,
            subject:" Job Board - New Employer Registration OTP ",
            html:"<h3> OTP for Account Verification is </h3> " + otp
        };

        transporter.sendMail(mailOptions,(error,info)=>{
            if (error){
                console.log("Send Mail Error due to .....");
                return console.log(error);
            }
            console.log("------------------------------------------");
            console.log('Message sent: %s',info.messageId);
            console.log("------------------------------------------");
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            console.log("------------------------------------------");
        })
        resolve(empData)
    })
    },
    otpVerified:(Data)=>{
        return new Promise(async(resolve,reject)=>{
        Data.password = await bcrypt.hash(Data.password,10)
        db.get().collection(collection.EMPLOYER_COLLECTION).insertOne({empemail:Data.email,empname:Data.username,emppwd:Data.password,empcompName:Data.empcompName,empcompLocation:Data.empcompLocation,empcompNum:Data.empcompNum,empcompWebsite:Data.empcompWebsite,status:"unblocked"}).then((data)=>{
            resolve(data.ops[0])
        })
        resolve()
        })
        
    },
    postJob:(jobDetails,callback)=>{
        console.log(" Employer Helpers Post Job -> Job Details");
        console.log(jobDetails);
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log(callback);
        jobDetails.status="unblocked"
        db.get().collection('jobs').insertOne(jobDetails).then((data)=>{
            console.log(" Data after Database Insertion ");
            console.log(data);
            callback(data.ops[0]._id)
        })
    },
    postedjobs:(empname)=>{
        return new Promise(async(resolve,reject)=>{
            let jobs = await db.get().collection(collection.JOB_COLLECTION).find({'empname':empname}).toArray()
            resolve(jobs)
        })
    },
    deleteJob:(jobID)=>{
        return new Promise((resolve,reject)=>{
            fs.unlink('./public/images/'+jobID+'.jpg',(err,done)=>{
                if (err){
                    console.log("!!! File Not Found !!!");
                }
                else{
                    console.log("----- Employer Logo Deleted Successfully -----");
                }
            })
            db.get().collection(collection.JOB_COLLECTION).removeOne({_id:ObjectId(jobID)}).then(()=>{
                resolve()
            })
        })
    },
    editJob:(jobID)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(" EDIT JOB");
            let jobDetails = await db.get().collection(collection.JOB_COLLECTION).findOne({_id:ObjectId(jobID)})
            resolve(jobDetails);
        })
    },
    updateJob:(jobID,jobDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.JOB_COLLECTION).updateOne({_id:ObjectId(jobID)},
            {
                $set:{
                    compName:jobDetails.compName,
                    compLocation:jobDetails.compLocation,
                    jobTitle:jobDetails.jobTitle,
                    timeSchedule:jobDetails.timeSchedule,
                    skills:jobDetails.skills,
                    qualification:jobDetails.qualification,
                    exp:jobDetails.exp,
                    desc:jobDetails.desc
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    jobSeekers: () => {
        return new Promise(async (resolve, reject) => {
            let jobseekers = await db.get().collection(collection.USER_COLLECTION).find({}).toArray();
            resolve(jobseekers)
        })
    },
    jobseekerAppliedJobs:()=>{
        return new Promise(async(resolve,reject)=>{
            let jobseekerDetails = await db.get().collection(collection.USER_COLLECTION).find({}).toArray();
            resolve(jobseekerDetails)
        })
    },
    jobDetails:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let jobdetails = await db.get().collection(collection.JOB_COLLECTION).find({'_id':ObjectId(id)}).toArray();
            resolve(jobdetails)
        })
    },
    viewProfile:(empname)=>{
        return new Promise(async(resolve,reject)=>{
            let employer =await db.get().collection(collection.EMPLOYER_COLLECTION).findOne({empname:empname});
            resolve(employer)
        })
    }
}