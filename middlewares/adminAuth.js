

const isLogedOut = async(req,res,next)=>{
    try {
        if(req.session.Admin){
            res.redirect('/admin/dash')
        }else{
            next();
        }
    } catch (error) {
        console.log("error on admin middleware",error);
    }
}

const isLogedIn = async(req,res,next)=>{
    try {
        if(req.session.Admin){
            next();
        }else{
            res.redirect('/admin/');
        }
        
    } catch (error) {
        console.log("admin middleware error",error)
    }
}

module.exports={
    isLogedIn,
    isLogedOut
}