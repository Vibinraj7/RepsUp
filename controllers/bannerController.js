const Banner = require('../models/bannerModel');

//..................................................................ADD NEW BANNER.............................
const addBanner = async (req, res) => {
    try {
        const adminSession = req.session.Admin;
        res.render('addBanner', { adminSession })
    } catch (error) {
        console.log('error in admin Add Banner', error.message)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//...............................................................................
const createBanner = async (req, res) => {
    try {
        const { title, startDate, endDate } = req.body
        const image = req.file.filename;
        console.log(title, startDate, endDate, image + "yoooooooooooooooooooooooooooooooooooooooooooo");


        const newBanner = new Banner({
            title: title,
            startDate: startDate,
            endDate: endDate,
            image: image
        });

        const set = await newBanner.save();

        if (set) {
            res.redirect('/admin/banners');
        }
    } catch (error) {
        console.log('error in admin create Banner', error.message)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//......................................................ALL BANNER LISTING .............................................'
const banner = async (req, res) => {
    try {
        const adminSession = req.session.Admin;
        const banner = await Banner.find();
        res.render('bannerList', { adminSession, banner });
    } catch (error) {
        console.log('error in admin  Banner Listing page', error.message)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//........................................................EDIT BANNER........................................................
const editBanner = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id);

        const adminSession = req.session.Admin
        const banner = await Banner.findById(id);
        res.render('editBanner', { banner, adminSession });

    } catch (error) {
        console.log('error in admin  Banner editing page', error.message)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//.................................................................SAVING EDITTED BANNER.............................................
const edittedBanner = async (req, res) => {
    try {
        const id = req.query.id;
       
      
        const title = req.body.title
        const startDate = req.body.startDate
        const endDate = req.body.endDate

        let updateBanner = {
            title: title,
            startDate: startDate,
            endDate: endDate
        }
        if (req.file) {
            updateBanner.image = req.file.filename
        }
        const updatedBanner = await Banner.findByIdAndUpdate(id, updateBanner, { new: true })

        if (updatedBanner) {
            res.redirect('/admin/banners')
        }
    } catch (error) {
        console.log('error in admin edited banner saving page', error.message)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}
//..........................................DELETE BANNER...................................................................
const deleteBanner= async(req,res)=>{
    try {
        const id  = req.query.id;
        const key = req.query.key;
        console.log(id,key);
       
        if(key == 'true'){
            const findBanner = await Banner.findByIdAndUpdate(id,{isActive:false});
        }else{
            const findBanner = await Banner.findByIdAndUpdate(id,{isActive:true});
        }
        res.redirect('/admin/banners');
       
    } catch (error) {
        console.log('error in admin delete Banner page', error.message)
        res.status(500).render('errorPage', { message: 'Internal server error', statuscode: 500 });
    }
}


module.exports = {
    addBanner,
    createBanner,
    banner,
    editBanner,
    edittedBanner,
    deleteBanner
}