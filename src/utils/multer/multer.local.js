import multer from 'multer';

export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime']
};

export const uploadFileLocal = (filter = null,req) => {
  const storage = multer.memoryStorage({});

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