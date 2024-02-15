const User = require('../models/userModel');

const isLogedOut = async(req,res,next)=>{
    try {
        if(req.session.user){
            res.redirect('/home')
          
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isLogedin = async(req,res,next)=>{
    try {
        if(req.session.user){
           next();
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isBlocked = async (req,res,next)=>{
    try {
        const id = req.session.user
        // console.log("this is id of user"+id)
        if(!id){
            next();
        }else{
        const user = await User.findById(id);
        // console.log("this is user session from is blocked" ,user);
        if(user.isBlocked == false){
            next();
        }else{
            req.session.destroy(err => {
                if (err) throw err;
                const userSession = req.session;
                const cartLength = 0
                res.render('login', { message: "your account has been blocked by administrator", userSession,cartLength })
              });
            // req.session.destroy(err => {
            //     if (err) throw err;
            //     const userSession = req.session;
            //     res.render('login',{message:"your account has been blocked by administrator",userSession})
            //   });
            // res.redirect('/isBlocked')
            //,{message:"your account has been blocked" ,userSession:req.session.user}
        }
    }

    } catch (error) {
        console.log("isBlocked middle ware error",error)
    }
}
module.exports={
    isLogedOut,
    isLogedin,
    isBlocked
}

