import { Router } from "express";
import * as userService from './user.service.js';
import { allowIf, auth } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { profileImageSchema, updateUserSchema, userIdSchema } from "./user.validation.js";
import { Roles } from "../../DB/models/user.model.js";
import { uploadFileCloud } from "../../utils/multer/multer.cloud.js";
// import { uploadFileLocal } from "../../utils/multer/multer.local.js";
// import { storeFile } from "../../middlewares/storeFile.middleware.js";

const userRouter = Router();
// src/modules/userModule/user.controller.js

userRouter.get('/all',
    auth(),
    userService.showUsers);

userRouter.delete('/',  
    auth(),
    userService.deleteUser);

userRouter.patch('/',
    auth(),
    validation(updateUserSchema),
    userService.updateUser);

userRouter.get('/share-profile',
    auth(),
    userService.shareProfile);


userRouter.delete('/soft-delete/:id',
    auth(),
    allowIf(Roles.admin),
    validation(userIdSchema),
    userService.softDeleteUser);

userRouter.post('/restore/:id',
    auth(),
    allowIf(Roles.admin),
    validation(userIdSchema),
    userService.restoreUser);

userRouter.patch('/profile-image',
    auth(),
    // uploadFileLocal('image').single('profileImage'),
    uploadFileCloud('image').single('profileImage'),
    validation(profileImageSchema),
    // storeFile('profileImage'),
    userService.uploadProfileImage);

userRouter.get('/profile-image',
    auth(),
    userService.getProfileImage);

userRouter.patch('/cover-images',
    auth(),
    // uploadFileLocal('cover_images', 'image').array('coverImages', 5),
    uploadFileCloud('image').array('coverImages', 5),
    userService.uploadCoverImages);

userRouter.get('/:id',
    validation(userIdSchema),
    userService.showUserById);

export default userRouter; 