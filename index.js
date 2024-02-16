const express = require('express');
const nocache = require('nocache');
const dbConnect = require('./dbConnect');
const app = express();
const path = require('path');


const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3000 ;
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

dbConnect();
app.use(nocache());
app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.set('view engine','ejs');
app.set('views','./views/user');
app.use(cookieParser());

app.use(session({secret:process.env.session_key,resave:false,saveUninitialized:false, cookie:{
    maxAge: 86400000,
}}))

app.use('/',userRoute)
app.use('/admin',adminRoute)




app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);

});