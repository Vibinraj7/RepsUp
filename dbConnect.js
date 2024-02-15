const mongoose = require("mongoose");
const dbConnect = ()=>{
    try {
        const connect = mongoose.connect("mongodb://127.0.0.1:27017/REPSUP_LOGIN");
        console.log("database connected");
    } catch (error) {
        console.log("database error")
    }
}
module.exports = dbConnect;