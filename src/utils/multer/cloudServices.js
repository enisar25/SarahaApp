import cloudinary from "./cloudConfig.js";

export const uploadSingleToCloud = async (filePath, dest) => {
    try {
        const {secure_url, public_id} = await cloudinary.uploader.upload(filePath, {
                folder: `${dest}`,
            });
        return { secure_url, public_id };
    } catch (error) {
        throw new Error('Cloud upload failed');
    }
};

export const deleteFromCloud = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error('Cloud deletion failed');
    }
};

export const uploadMultipleToCloud = async (filePaths, dest) => {
    try {
        const uploadPromises = filePaths.map(filePath =>{
            return cloudinary.uploader.upload(filePath, {
                folder: `${dest}`,
            });
        }
        );
        const uploadResults = await Promise.all(uploadPromises);
        return uploadResults.map(({secure_url, public_id}) => ({ secure_url, public_id }));
    } catch (error) {
        throw new Error('Cloud multiple upload failed');
    }
};