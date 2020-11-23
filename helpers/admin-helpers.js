var db = require('../config/connections')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')

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
    }
}