import UserModel from '../../DB/models/user.model.js';
import { successHandler } from '../../utils/succesHandler.js';
import { hash, compareHash } from '../../utils/hash.js';
import { NotFoundError, UnauthorizedError, ConflictError, ValidationError, BadRequestError, ForbiddenError, ErrorHandler } from '../../utils/errorHandler.js';
import * as DBservices from '../../DB/DBservices.js';
import { template } from '../../utils/sendMail/createHtml.js'
import { sendMail , createOtp } from '../../utils/sendMail/sendMail.js';
// src/modules/authModule/password.service.js

export const forget_password = async(req, res, next) => {
    const { email } = req.body
    if(!email){
        return next(new BadRequestError('email is required'))
    }
    const user = await DBservices.findOne(UserModel, {email})
    if(!user){
        return next(new NotFoundError('user not found'))
    }
    const otp = createOtp()
    const subject = 'forget password verification'
    const html = template(otp, user.name, subject)

    const mail = await sendMail(user.email,subject, html)  
    if(mail instanceof Error){
        return next(new ErrorHandler('could not send mail'));
    }  
    
    await user.updateOne({
        resetPasswordToken: {
            code : otp,
            expiresAt: Date.now() + 1000 * 60 * 10, // 10 minutes
        }
            })

    return successHandler(res, {}, 'otp sent to email');
}

export const reset_password = async(req, res, next) => {
    const { email, otp, newPassword } = req.body
    if(!email || !otp || !newPassword){
        return next(new BadRequestError('email, otp and new password are required'))
    }
    const user = await DBservices.findOne(UserModel, {email})
    if(!user){
        return next(new NotFoundError('user not found'))
    }
    if ( Date.now() > user.resetPasswordToken?.expiresAt ){
        return next(new ForbiddenError('otp expired'))
    }
    if (!compareHash( otp, user.resetPasswordToken.code )) {
        return next(new UnauthorizedError('invalid otp'))
    }
    await user.updateOne({
            isVerified: true,
            password: newPassword,
            credentialsChangedAt: Date.now(),
            $unset:{
                resetPasswordToken:""
            }
        })
        
    return successHandler(res, {}, 'password reseted');
}