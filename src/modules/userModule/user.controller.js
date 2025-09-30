import { Router } from "express";
import * as userService from './user.service.js';
import { auth } from "../../middlewares/auth.middleware.js";
const userRouter = Router();
// userRouter.use(auth());
// src/modules/userModule/user.controller.js

userRouter.get('/all',auth(), userService.showUsers);
userRouter.delete('/',auth(), userService.deleteUser);
userRouter.patch('/',auth(), userService.updateUser);
userRouter.get('/share-profile',auth(), userService.shareProfile);
userRouter.get('/:id', userService.showUserById);
export default userRouter; 