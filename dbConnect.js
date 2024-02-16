require('dotenv').config();


const mongoose = require("mongoose");
const dbConnect = ()=>{
    try {
        const connect = mongoose.connect(process.env.DB_URI);
        console.log("database connected");
    } catch (error) {
        console.log("database error")
    }
}
module.exports = dbConnect;