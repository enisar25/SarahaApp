import UserModel, { Providers } from '../../DB/models/user.model.js';
import { successHandler } from '../../utils/succesHandler.js';
import { compareHash } from '../../utils/hash.js';
import { NotFoundError, UnauthorizedError, ConflictError, ValidationError, BadRequestError, ForbiddenError, ErrorHandler } from '../../utils/errorHandler.js';
import * as DBservices from '../../DB/DBservices.js';
import { template } from '../../utils/sendMail/createHtml.js'
import { sendMail , createOtp } from '../../utils/sendMail/sendMail.js';
import e from 'cors';

// src/modules/authModule/email.service.js

export const confirm_email = async (req, res, next) => {
  const id = req.user._id;
  const { otp } = req.body;

  if (!otp) {
    return next(new BadRequestError('otp is required'));
  }

  const user = await DBservices.findById(UserModel, id);

  if (!user) {
    return next(new NotFoundError('user not found'));
  }

  if (user.isVerified && !user.newEmailOtp?.code) {
    return next(new ConflictError('user already verified'));
  }
  let state = 'otp'
  if( user.newEmailOtp?.code ){
    state = 'newEmailOtp'
  }

  if (user[state]?.lockUntil && Date.now() < user[state].lockUntil) {
    return next(
      new ForbiddenError(
        `Too many failed attempts. Try again after ${new Date(user[state].lockUntil).toLocaleString()}`
      )
    );
  } else if (user[state].lockUntil && Date.now() >= user[state].lockUntil) {
    user[state].attempts = 0;
    user[state].lockUntil = undefined;
    await user.save();
  }

  if (Date.now() > user[state].expiresAt) {
    return next(new ForbiddenError('otp expired'));
  }

  const isValidOtp =  compareHash(otp, user[state].code); 
  if (!isValidOtp) {
    user[state].attempts = (user[state].attempts || 0) + 1;

    if (user[state].attempts >= 5) {
      user[state].lockUntil = Date.now() + 1000 * 60 * 5; // lock for 5 minutes
    }

    await user.save();
    return next(new ForbiddenError('Invalid OTP'));
  }

  const updatedUser = await DBservices.updateById(UserModel, id,
     {
        isVerified: true,
        $unset: {
         otp: "",
          newEmailOtp: "",
        } 
    }, { new: true });

  return successHandler(res, { user: updatedUser }, 'email confirmed'); 
};

export const resend_otp = async(req, res, next) => {
    const id  = req.user._id
    const user = await DBservices.findById(UserModel, id)

    if(!user){
        return next(new NotFoundError('user not found'))
    }
    if(user.isVerified){
        return next(new ConflictError('user already verified'))
    }
    const otp = createOtp()
    const subject = 'resend user verification'
    const html = template(otp, user.name, subject)
    await sendMail(user.email, subject, html)

    user.otp.code = otp
    user.otp.expiresAt = Date.now() + 1000 * 60 * 2
    user.otp.attempts = 0
    user.otp.lockUntil = undefined
    await user.save()
    return successHandler(res, {}, 'otp resent');
}


export const update_email = async(req, res, next) => {
    const email  = req.user.email
    const newEmail = req.body.email
    if(!newEmail){
        return next(new BadRequestError('email is required'))
    }
    const isEmailExist = await DBservices.findOne(UserModel, {email:newEmail})
    if(isEmailExist){
        return next(new ConflictError('email already exists'))
    }
    if (email === newEmail){
        return next(new BadRequestError('new email must be different from current email'))
    }

    const user = await DBservices.findOne(UserModel, {email})
    if(!user){
        return next(new NotFoundError('user not found'))
    }
    if(!user.isVerified){
        return next(new ForbiddenError('user not verified'))
    }
    const otp = createOtp()
    const subject = 'Verify change email'
    const html = template(otp, user.name, subject)
    const mail = await sendMail(user.email, subject, html)
    if(mail instanceof Error){
        return next(new Error('Failed to send verification email'))
    }
    const mail2 = await sendMail(newEmail, subject, html)
    if(mail2 instanceof Error){
        return next(new Error('Failed to send verification email to new email'))
    }
    await user.updateOne({
        resetEmailOtp: {
            code : otp,
            expiresAt: Date.now() + 1000 * 60 * 10, // 10 minutes
        },
        newEmailOtp: {
          email: newEmail,
          code: otp,
          expiresAt: Date.now() + 1000 * 60 * 10, // 10 minutes
        }
            })
    return successHandler(res, {}, 'otp sent to email');
}

export const confirm_update_email = async(req, res, next) => {
    const email  = req.user.email
    const { otp, newEmail } = req.body
    if(!otp || !newEmail){
        return next(new BadRequestError('otp and new email are required'))
    }
    const user = await DBservices.findOne(UserModel, {email})
    if(!user){
        return next(new NotFoundError('user not found'))
    }
   if(!user.isVerified){
        return next(new ForbiddenError('user not verified'))
    }

    if(user.newEmailOtp?.email !== newEmail){
        return next(new BadRequestError('new email does not match the requested email'))
    }

    if(!user.resetEmailOtp?.expiresAt){
        return next(new UnauthorizedError('no email update request found'))
    }
    if ( Date.now() > user.resetEmailOtp.expiresAt ){
        return next(new ForbiddenError('otp expired'))
    }
    if ( !compareHash( otp, user.resetEmailOtp.code ) ) {
        return next(new UnauthorizedError('invalid otp'))
    }
    await user.updateOne({
            email: newEmail,
            isVerified: false,
            provider: Providers.system,
            credentialsChangedAt: Date.now(),
            $unset:{
                resetEmailToken:"",
                providerId:"",
            }
        })
    return successHandler(res, {}, 'email updated but not verified yet');
}
