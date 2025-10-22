import UserModel from '../../DB/models/user.model.js';
import { successHandler } from '../../utils/succesHandler.js';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../../utils/errorHandler.js';
import * as DBservices from '../../DB/DBservices.js';
import cloudinary from '../../utils/multer/cloudConfig.js';
import { deleteFromCloud, uploadMultipleToCloud, uploadSingleToCloud } from '../../utils/multer/cloudServices.js';
// import path from 'path';
// import fs from 'fs/promises';

 
// src/modules/userModule/user.service.js

export const showUsers = async (req, res, next) => {

    const users = await DBservices.findAll(UserModel);
    if(!users || users.length === 0){
         return next(new NotFoundError('No users found'));
    }

    return successHandler(res, { users }, 'Users fetched successfully');
}

export const deleteUser = async (req, res, next) => {

    const { id } = req.user;
    const deleted = await DBservices.deleteById(UserModel, id);

    if (!deleted) {
        return next(new NotFoundError('User not found'));
    }

    return successHandler(res, {}, 'User deleted');
}

export const updateUser = async (req, res, next) => {

    const { id } = req.user
    const { name, age, email } = req.body;

    if ( await DBservices.findOne(UserModel, { email }) ) {
        return next(new ConflictError('Email already exists'));
    }
    
    const updatedUser = await DBservices.updateById( UserModel, id,
        { name, email, age },
        { new: true } 
    );

    if (updatedUser) {
        return successHandler(res, { user: updatedUser }, 'User updated');
    } else {
        return next(new NotFoundError('User not found'));
    }
}

export const showUserById = async (req, res, next) => {
    const { id } = req.params;
    const user = await DBservices.findById(UserModel, id, null, 'name email');
    if (!user) {
        return next(new NotFoundError('User not found'));
    }
    return successHandler(res, { user }, 'User fetched successfully');
}

export const shareProfile = async (req, res, next) => {
    const id = req.user._id;
    const user = await DBservices.findById(UserModel, id);
    if (!user) {
        return next(new NotFoundError('User not found'));
    }
    const profileLink = `${req.protocol}://${req.host}/user/${user._id}`;
    return successHandler(res, { profileLink }, 'Profile link generated successfully');
}

export const softDeleteUser = async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await DBservices.updateById( UserModel, id,
    {
      'deleted.deletedAt': new Date(),
      'deleted.deletedBy': req.user._id,
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(new NotFoundError('User not found'));
  }

  return successHandler(res, {}, 'User soft deleted');
};

export const restoreUser = async (req, res, next) => {
    const { id } = req.params;
    user = DBservices.findDeleted(UserModel, id);

    if (!user) {
      return next(new NotFoundError('User not found or not deleted'));
    }

    if (user.deleted.deletedBy != req.user._id) {
        return next(new UnauthorizedError('You are not authorized to restore this user'));
    }

    const restoredUser = await DBservices.updateById( UserModel, id,
      {
        'deleted.deletedAt': null,
        'deleted.deletedBy': null,
      },
      { new: true }
    );

    return successHandler(res, { user: restoredUser }, 'User restored successfully');
}


/*//upload profile image locally
export const uploadProfileImage = async (req, res, next) => {
    if (!req.file) {
        return next(new ValidationError('No file uploaded'));
    }
    const { id } = req.user;
    const imagePath = path.join(req.file.destination, req.file.filename).replace(/\\/g, '/');
    const user = await DBservices.findById(UserModel, id);

    if (user.profileImage) {
        try {
            await fs.unlink(user.profileImage);
        } catch (err) {
            console.error('Error deleting old profile image:', err);
        }
    } 
    await DBservices.updateById(UserModel, id, { profileImage: imagePath }, { new: true });
    return successHandler(res , 'Profile image updated');
}*/

export const uploadProfileImage = async (req, res, next) => {
    if (!req.file) {
        return next(new ValidationError('No file uploaded'));
    }

    if(req.user.profileImage.publicId) {
       await deleteFromCloud(req.user.profileImage.publicId);
    }

    const { secure_url, public_id } = await uploadSingleToCloud(req.file.path, `profile_images/${req.user._id}`);

    await DBservices.updateById(UserModel, req.user._id, 
        { profileImage: { secureUrl: secure_url, publicId: public_id } }, 
        { new: true }
    );

    return successHandler(res , 'Profile image updated');
}

export const getProfileImage = async (req, res, next) => {
    const { id } = req.user;
    const user = await DBservices.findById(UserModel, id);
    if (!user || !user.profileImage.secureUrl) {
        return next(new NotFoundError('Profile image not found'));
    }
    //Linked to local upload
    // const imageLink = `${req.protocol}://${req.host}/${user.profileImage}`;

    const imageLink = user.profileImage.secureUrl;
    return successHandler(res, { imageLink }, 'Profile image fetched successfully');
}

export const uploadCoverImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new ValidationError('No files uploaded'));
    }

    const paths = req.files.map( file => file.path );
    const upload = await uploadMultipleToCloud( paths, `cover_images/${req.user._id}` );
    let coverImages = upload.map(({ secure_url, public_id }) => ({ secureUrl: secure_url, publicId: public_id }));
    if (req.user.coverImages && req.user.coverImages.length > 0) {
        coverImages.push(...req.user.coverImages);
    }
    const updated = await DBservices.updateById(UserModel, req.user._id,
        { coverImages },
        { new: true }
    );
    return successHandler(res, {user : updated},'Cover images uploaded successfully');
}

