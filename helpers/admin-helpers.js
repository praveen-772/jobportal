var db = require('../config/connections')
var collection = require('../config/collections')
var fs = require('fs');
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')

module.exports={
    createAccount:(adminData)=>{
        return new Promise(async(resolve, reject)=>{
            adminData.adminname = 'admin'
            adminData.adminpwd = 'admin'
            adminData.adminpwd = await bcrypt.hash(adminData.adminpwd,10)
            let adminCheck = await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminname:'admin'})
            if (adminCheck){
                resolve()
            }
            else{
                    db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
                    resolve(data.ops[0])
                    console.log("Admin Account Created");
                })
            }
        })
    },
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response={}
            let adminVerify = await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminname:adminData.adminname})
            if (adminVerify){
                bcrypt.compare(adminData.adminpwd,adminVerify.adminpwd).then((status)=>{
                    if (status){
                        console.log("Admin Login Success Verified from Database");
                        response.admin = adminVerify
                        response.status = true
                        resolve(response)
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
    listEmployers:()=>{
        return new Promise((resolve,reject)=>{
            status = "unblocked"
            let employers = db.get().collection(collection.EMPLOYER_COLLECTION).find({'status':status}).toArray()
            resolve(employers)
        })
    },
    deleteEmployer:(emp)=>{
        return new Promise(async(resolve,reject)=>{
            empname = emp.name
            console.log(empname);
            let jobs = await db.get().collection(collection.JOB_COLLECTION).find({'empname':empname}).toArray()
            console.log("++++++++++++++++++++++++");
            console.log(jobs);
            console.log("++++++++++++++++++++++++");
            console.log(jobs.length);
            for(i=0;i<jobs.length;i++){
                jobID = jobs[i]._id;
                fs.unlink('./public/images/'+jobID+'.jpg',(err,done)=>{
                    if (err){
                        console.log("!!! File Not Found !!!");
                    }
                    else{
                        console.log("----- Employer Logo Deleted Successfully -----");
                    }
                })
            }
            db.get().collection(collection.EMPLOYER_COLLECTION).deleteOne({'empname':empname})
            await db.get().collection(collection.JOB_COLLECTION).deleteMany({'empname':empname}).then((response)=>{
                console.log("!!! Employer & Jobs Deletion Completed !!!");
                resolve(response)
            })
        })
    },
    blockEmployer:(emp)=>{
        return new Promise(async(resolve,reject)=>{
            empname = emp.name;
                db.get().collection(collection.EMPLOYER_COLLECTION).updateOne({'empname':empname},{$set:{status:"blocked"}})
                await db.get().collection(collection.JOB_COLLECTION).updateMany({'empname':empname},{$set:{status:"blocked"}}).then((response)=>{
                resolve(response)
            })
        })
    },
    blockedEmployers:()=>{
        return new Promise(async(resolve,reject)=>{
            status = "blocked"
            let employers = await db.get().collection(collection.EMPLOYER_COLLECTION).find({'status':status}).toArray()
            resolve(employers);
        })
    },
    unblockEmployer:(emp)=>{
        return new Promise(async(resolve,reject)=>{
            empname = emp.name;
                    db.get().collection(collection.EMPLOYER_COLLECTION).updateOne({'empname':empname},{$set:{status:"unblocked"}})
                await db.get().collection(collection.JOB_COLLECTION).updateMany({'empname':empname},{$set:{status:"unblocked"}}).then((response)=>{
                resolve(response)
            })
        })
    }
}