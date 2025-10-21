import { Router } from "express";
import * as userService from './user.service.js';
import { allowIf, auth } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { profileImageSchema, updateUserSchema, userIdSchema } from "./user.validation.js";
import { Roles } from "../../DB/models/user.model.js";
import { ALLOWED_FILE_TYPES, uploadfile } from "../../utils/multer/multer.js";
const userRouter = Router();
// userRouter.use(auth());
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
    uploadfile('profile_images', ALLOWED_FILE_TYPES.image).single('profileImage'),
    validation(profileImageSchema),
    userService.uploadProfileImage);

userRouter.get('/profile-image',
    auth(),
    userService.getProfileImage);

userRouter.get('/:id',
    validation(userIdSchema),
    userService.showUserById);

export default userRouter; 