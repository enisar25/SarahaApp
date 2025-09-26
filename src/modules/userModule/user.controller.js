import { Router } from "express";
import * as userService from './user.service.js';
import { auth } from "../../middlewares/auth.middleware.js";
const userRouter = Router();
userRouter.use(auth());

// src/modules/userModule/user.controller.js

userRouter.get('/', userService.showUserById);
userRouter.get('/all', userService.showUsers);
userRouter.delete('/', userService.deleteUser);
userRouter.patch('/', userService.updateUser);

export default userRouter;