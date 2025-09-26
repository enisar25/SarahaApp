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
    console.log(req.user._id);
    const { id } = req.user;
    const user = await DBservices.findById(UserModel, id);
    if (!user) {
        return next(new NotFoundError('User not found'));
    }
    return successHandler(res, { user }, 'User fetched successfully');
}

