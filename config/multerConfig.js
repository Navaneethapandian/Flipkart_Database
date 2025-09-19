const multer = require('multer');

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
    return cb(new Error('Only JPG or JPEG files are allowed!'), false);
  }
  cb(null, true);
};

const deliveryBoyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './deliveryBoyProfile'); // folder for delivery boy profile pics
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + '-' + file.originalname);
  },
});

const deliveryBoyUpload = multer({ storage: deliveryBoyStorage, fileFilter });

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './userProfile'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + '-' + file.originalname);
  },
});

const userUpload = multer({ storage: userStorage, fileFilter });

const adminStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './adminProfile');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + '-' + file.originalname);
  },
});

const adminUpload = multer({ storage: adminStorage, fileFilter });

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploadDocs'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + '-' + file.originalname);
  },
});

const uploadDoc = multer({ storage: docStorage });

module.exports = {
  deliveryBoyUpload,
  userUpload,
  adminUpload,
  uploadDoc
};
