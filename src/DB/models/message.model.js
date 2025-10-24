import mongoose from "mongoose";    

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});
 
const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;