var db = require('../config/connections')
var collection = require('../config/collections')
var fs = require('fs');
// var request = require('request');
// var springedge = require('springedge');

const bcrypt = require('bcrypt')
const bodyparser = require('body-parser')

module.exports={
    allJobs:()=>{
        return new Promise(async(resolve,reject)=>{
            status = "unblocked"
            let jobs = await db.get().collection(collection.JOB_COLLECTION).find({'status':status}).toArray();
            resolve(jobs)
        })
    },
    createAccount:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let userCheck = await db.get().collection(collection.USER_COLLECTION).findOne({'userEmail':userData.userEmail})
            if(userCheck){
                userData.info = "User Account already exists";
                resolve(userData)
            }
            else{

            }
            resolve()
        })
    },
    otpGenerator:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            var messagebird = require('messagebird')('8yivcZzU7LYtp4OJWz8IxO4EK')
            var otp = Math.random();
            var mobile = userData.userMobile;
            otp = otp * 1000000;
            otp = parseInt(otp);
            console.log(mobile);
            console.log(otp);

            await messagebird.messages.create({
                originator : +971563068466,
                recipients : mobile,
                body : otp
            },
            function (err, response) {
                if (err) {
                console.log("ERROR:");
                console.log(err);
            } else {
                console.log("SUCCESS:");
                console.log(response);
                console.log("++++++++++++++++++++++++++");
                    }
            });
            resolve(otp);

              


            // var options = {
            //     'method': 'POST',
            //     'url': 'https://d7networks.com/api/verifier/send',
            //     'headers': {
            //       'Authorization': 'anpxczI3MDI6N3Y4MTZ0eXk='
            //     },
            //     formData: {
            //       'mobile': '971563068466',
            //       'sender_id': 'SMSINFO',
            //       'message': 'Your otp code is {otp}',
            //       'expiry': '900'
            //     }
            //   };
            //   request(options, function (error, response) {
            //     if (error) throw new Error(error);
            //     console.log(response.body);
            //   });
              




            // var params = {
            //     'sender': 'SEDEMO',
            //     'apikey': '6mj40q3t7o89qz93cn0aytz8itxg6641',
            //     'to': [
            //       '0563068466'  //Moblie Numbers 
            //     ],
            //     'message': 'Hi, this is a test message',
            //     'format': 'json'
            //   };
               
            //   springedge.messages.send(params, 5000, function (err, response) {
            //     if (err) {
            //       return console.log(err);
            //     }
            //     console.log(response);
            //   });

        })
    }
}