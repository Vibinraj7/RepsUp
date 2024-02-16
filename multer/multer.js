



const path = require('path');
const multer = require('multer');

// Define storage settings for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Define the destination directory for uploaded files
    callback(null, 'public/admin/assets/imgs/category');
  },
  filename: (req, file, callback) => {
    // Define the filename for uploaded files
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Define a function to filter uploaded files
const fileFilter = (req, file, callback) => {
  // Check the file mimetype to allow only specific image formats
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    callback(null, true); // Allow the upload
  } else {
    callback(new Error('Only JPG files are allowed!'), false); // Reject the upload
  }
};

// Configure Multer with defined storage and file filter settings
const upload = multer({ 
  storage: storage,
  // fileFilter: fileFilter
});

// Export the configured upload object for usage in other parts of the application
module.exports = { upload };
