import UserModel from '../../DB/models/user.model.js';
import { successHandler } from '../../utils/succesHandler.js';
import { hash, compareHash } from '../../utils/hash.js';
import { encrypt } from '../../utils/encryption.js';
import { NotFoundError, UnauthorizedError, ConflictError, ValidationError, BadRequestError, ForbiddenError } from '../../utils/errorHandler.js';
import * as DBservices from '../../DB/DBservices.js';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import { template } from '../../utils/sendMail/createHtml.js'
import { sendMail } from '../../utils/sendMail/sendMail.js';
import { verifyGoogleIdToken } from '../../utils/verifyGoogle.js';

// src/modules/authModule/auth.service.js

export const signup = async (req, res, next) => {
    const { name, email, password, phone, age } = req.body;
    if ( !name || !email || !password || !phone || !age ) {
        return next(new ValidationError('Missing required fields'));
    }
    if ( await DBservices.findOne(UserModel, { email }) ) {
        return next(new ConflictError('Email already exists'));
    }

    const custom = customAlphabet('0123456789')
    const otp =custom(6)
    const subject = 'user verification'
    const html = template(otp, name, subject)

    const newUser = await DBservices.create(
        UserModel, {
             name,
             email,
             password: hash(password),
             phone : encrypt(phone),
             age,
             otp: hash(otp),
             otpExpiresAt: Date.now() + 1000 * 60 * 2
            }
    );

    await sendMail(email, subject, html)

    return successHandler(res, { user: newUser }, 'User added successfully', 201);
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ValidationError('Email and password are required'));
    }
    const user = await DBservices.findOne(UserModel, { email } );
    if(user && user.provider !== 'system' && !user.password){
       user.provider = 'system';
       user.password = hash(password);
       await user.save();
       return next(new UnauthorizedError('Login again using same credentials'));
    }
    const isPasswordValid = compareHash(password, user.password);

    if (!user || !isPasswordValid) {
        return next(new UnauthorizedError('Invalid email or password'));
    } 
    const access_token = jwt.sign({ id: user._id}, process.env.ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN }); 
    const refresh_token = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });  
    return successHandler(res, { access_token: access_token, refresh_token: refresh_token  }, 'login successful');
}

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

  if (user.isVerified) {
    return next(new ConflictError('user already verified'));
  }

  if (user.otpLockUntil && Date.now() < user.otpLockUntil) {
    return next(
      new ForbiddenError(
        `Too many failed attempts. Try again after ${new Date(user.otpLockUntil).toLocaleString()}`
      )
    );
  } else if (user.otpLockUntil && Date.now() >= user.otpLockUntil) {
    user.otpAttempts = 0;
    user.otpLockUntil = undefined;
    await user.save();
  }

  if (Date.now() > user.otpExpiresAt) {
    return next(new ForbiddenError('otp expired'));
  }

  const isValidOtp =  compareHash(otp, user.otp); 
  if (!isValidOtp) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;

    if (user.otpAttempts >= 5) {
      user.otpLockUntil = Date.now() + 1000 * 60 * 5; // lock for 5 minutes
    }

    await user.save();
    return next(new ForbiddenError('Invalid OTP'));
  }

  const updatedUser = await DBservices.updateById(UserModel, id,
     {
        isVerified: true,
        $unset: {
         otp: "",
         otpExpiresAt: "",
         otpAttempts: "",
         otpLockUntil: "" 
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
    const custom = customAlphabet('0123456789')
    const otp =custom(6)
    const subject = 'resend user verification'
    const html = template(otp, user.name, subject)
    await sendMail(user.email, subject, html)

    user.otp = hash(otp)
    user.otpExpiresAt = Date.now() + 1000 * 60 * 2
    await user.save()
    return successHandler(res, {}, 'otp resent');
}

export const forget_password = async(req, res, next) => {
    const { email } = req.body
    if(!email){
        return next(new BadRequestError('email is required'))
    }
    const user = await DBservices.findOne(UserModel, {email})
    if(!user){
        return next(new NotFoundError('user not found'))
    }
    const custom = customAlphabet('0123456789')
    const otp =custom(6)
    const subject = 'forget password verification'
    const html = template(otp, user.name, subject)
    await sendMail(user.email,subject, html)    
    user.otp = hash(otp)
    user.otpExpiresAt = Date.now() + 1000 * 60 * 2
    await user.save()
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
    if ( Date.now() > user.otpExpiresAt ){
        return next(new ForbiddenError('otp expired'))
    }
    if (!compareHash( otp, user.otp )){
        return next(new UnauthorizedError('invalid otp'))
    }
    await user.updateOne({
            isVerified: true,
            password: hash(newPassword),
            credentialsChangedAt: Date.now(),
            $unset:{
                otp:"",
                otpExpiresAt: "",
            }
        })
    return successHandler(res, {}, 'password reseted');
}

export const getAccessToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new NotFoundError('Unauthorized'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
        const user = await DBservices.findById(UserModel, decoded.id);
        if (!user) {
            return next(new NotFoundError('User not found'));
        }
        const newToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN });
        return successHandler(res, { access_token: newToken }, 'Token created successfully');
    }
    catch (err) {
        return next(new UnauthorizedError('Invalid token'));
    }   
}

export const social_login = async(req, res, next) => {
    const idToken  = req.body.idToken;
    if (!idToken) {
        return next(new BadRequestError('idToken is required'));
    }
    let payload;
    try {
        payload = await verifyGoogleIdToken(idToken);
    } catch (error) {
        return next(new UnauthorizedError('Invalid Google ID token'));
    }
    let user = await DBservices.findOne(UserModel, { email: payload.email });
    if (!user) {
        user = await DBservices.create(UserModel, {
            name: payload.name,
            email: payload.email,
            isVerified: true,
            provider: 'google',
            providerId: payload.sub
        });
    } else if (user.provider !== 'google') {
        user.provider = 'google';
        user.providerId = payload.sub;
        await user.save();
    }
    const access_token = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN });
    const refresh_token = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });
    return successHandler(res, { access_token, refresh_token }, 'Social login successful'); 

}

