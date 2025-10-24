import * as DBservices from "../../DB/DBservices.js";
import UserModel from "../../DB/models/user.model.js";
import MessageModel from "../../DB/models/message.model.js";
import { NotFoundError } from "../../utils/errorHandler.js";
import { successHandler } from "../../utils/succesHandler.js";

export const sendMessage = async (req, res, next) => {
    const { recipientId, content } = req.body;
    const from  = req.params?.from

    const isExistingUser = await DBservices.findById(UserModel, recipientId);
    if (!isExistingUser) {
        return next(new NotFoundError('Recipient user not found'));
    }
    
    const isExistingSender = await DBservices.findById(UserModel, from);
    if (from && !isExistingSender) {
        return next(new NotFoundError('Sender user not found'));
    }

    const messageData = {
        senderId: from,
        recipientId,
        content
    };
    
    const message = await DBservices.create(MessageModel, messageData);
    return successHandler(res, { message }, 'Message sent successfully');
}

export const getAllMessages = async (req, res, next) => {
    const messages = await DBservices.find(MessageModel,
         {recipientId: req.user.id},
         'senderId content createdAt',
         null,null,null,
         { path: 'senderId', select: 'name email profileImage.secureUrl' }
    );

    if (!messages || messages.length === 0) {
        return next(new NotFoundError('No messages found'));
    }

    return successHandler(res, { messages }, 'Messages fetched successfully');
}

export const getMessageById = async (req, res, next) => {
    const { id } = req.params;
    const message = await DBservices.find(MessageModel,
        { _id: id, recipientId: req.user.id } ,
        'senderId content createdAt',
        null,null,null,
        {path: 'senderId', select: 'name email profileImage.secureUrl' }
    )
    if (!message) {
        return next(new NotFoundError('Message not found'));
    }
    return successHandler(res, { message: message}, 'Message fetched successfully');
}

export const deleteMessagebyId = async(req,res,next) =>{
    const id = req.params.id
    const message = await DBservices.find(MessageModel, {_id : id, senderId: req.user._id})
    if(!message){
        next(new NotFoundError('Message not found'))
    }
    await DBservices.deleteById(MessageModel,id)
    return successHandler(res, 'Message deleted')
}


    