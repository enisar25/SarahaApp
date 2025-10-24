import { Router } from "express";   
import * as messageServices from './message.service.js';
import { auth } from '../../middlewares/auth.middleware.js';

const messageRouter = Router();
// src/modules/messageModule/message.controller.js

messageRouter.post('/send{/:from}',
    messageServices.sendMessage);

messageRouter.get('/',
    auth(),
    messageServices.getAllMessages);

messageRouter.get('/:id',
    auth(),
    messageServices.getMessageById);

messageRouter.delete('/:id',
    auth(),
    messageServices.deleteMessagebyId
)

export default messageRouter;