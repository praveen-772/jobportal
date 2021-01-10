const mongoClient = require('mongodb').MongoClient
const state = { db:null }

module.exports.connect = function(done){
    const url = 'mongodb+srv://praveen_772:Praveenmongodb123@cluster0.z3wtz.mongodb.net/Jobportal?retryWrites=true&w=majority';
    const dbname = 'Jobportal'

    // const url = 'mongodb://localhost:27017';
    // const dbname = 'jobportal'

    mongoClient.connect(url,(err,data)=>{
        if (err) {  return done(err)    }
        else{
            state.db = data.db(dbname)
        }
    })
}

module.exports.get = function(){
    return state.db
}