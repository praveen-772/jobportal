var db = require('../config/connections')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const bodyparser = require('body-parser')

module.exports={
    allJobs:()=>{
        return new Promise(async(resolve,reject)=>{
            status = "unblocked"
            let jobs = await db.get().collection(collection.JOB_COLLECTION).find({'status':status}).toArray();
            resolve(jobs)
        })
    }
}