import multer from 'multer'; 
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, '/public/temp');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png files are allowed"), false);
  }
};


export const upload = multer({

    storage,
    fileFilter,
    
}
)