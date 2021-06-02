import { Request } from 'express';
import multer from 'multer';
import path from 'path';

const { v4: uuidV4 } = require('uuid');

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${file.originalname}-uudid-${uuidV4()}${extension}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: CallableFunction,
) => {
  const allowedFileTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1000000, // max file size 1MB = 1000000 bytes
  },
});
