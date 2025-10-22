import fs from 'fs/promises';

 const handlepath = async(file, path) => {
    const folderName = `uploads/${path}`;
    await fs.mkdir(folderName, { recursive: true });
    return `${folderName}/${file.originalname}`;
}

export const storeFile = (path) => {
    return async (req, res, next) => {
       const fullPath = await handlepath(req.file, path)
       const buffer = req.file.buffer;
         await fs.writeFile(fullPath, buffer);
         req.file.path = fullPath;
         next();
    };
}