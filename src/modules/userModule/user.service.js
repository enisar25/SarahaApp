import UserModel from '../../DB/models/user.model.js';
import { successHandler } from '../../utils/succesHandler.js';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../../utils/errorHandler.js';
import * as DBservices from '../../DB/DBservices.js';

 
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