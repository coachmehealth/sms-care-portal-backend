import multer from 'multer';
import path from 'path';

const { v4: uuidV4 } = require('uuid');

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, uuidV4() + path.extname(file.originalname));
  }
});

export default multer({storage});
