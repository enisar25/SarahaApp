import multer from 'multer';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';

export const uploadfile = (folderName = 'general') => {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const uploadPath = `./uploads/${folderName}/${req.user?. _id || 'public'}`;
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      cb(null, `${nanoid(7)}_${file.originalname}`);
    }
  });

  const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB limit (adjust)
  const fileFilter = (req, file, cb) => {
    // Accept anything by default — add checks if needed
    cb(null, true);
  };

  return multer({ storage, limits, fileFilter });
};