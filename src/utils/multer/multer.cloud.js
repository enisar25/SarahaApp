import multer from 'multer';
import { ALLOWED_FILE_TYPES } from './multer.local.js';

export const uploadFileCloud = ( filter = null) => {

  const storage = multer.diskStorage({});
  const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB limit (adjust)
  const fileFilter = (req, file, cb) => {
    // Accept anything by default — add checks if needed
    if (filter && ALLOWED_FILE_TYPES[filter]) {
      if (!ALLOWED_FILE_TYPES[filter].includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Only ${filter} files are allowed.`));
      }}
    cb(null, true);
  };

  return multer({ storage, limits, fileFilter });
};