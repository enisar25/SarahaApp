import UserModel, { Providers } from '../../DB/models/user.model.js';
import { successHandler } from '../../utils/succesHandler.js';
import { compareHash } from '../../utils/hash.js';
import { NotFoundError, UnauthorizedError, ConflictError, ValidationError, BadRequestError, ForbiddenError, ErrorHandler } from '../../utils/errorHandler.js';
import * as DBservices from '../../DB/DBservices.js';
import jwt from 'jsonwebtoken';
import { template } from '../../utils/sendMail/createHtml.js'
import { sendMail , createOtp } from '../../utils/sendMail/sendMail.js';
import { verifyGoogleIdToken } from './verifyGoogle.js';

// src/modules/authModule/auth.service.js

export const signup = async (req, res, next) => {
    const { name, email, password, phone, age } = req.body;
    if ( !name || !email || !password || !phone || !age ) {
        return next(new ValidationError('Missing required fields'));
    }
    if ( await DBservices.findOne(UserModel, { email }) ) {
        return next(new ConflictError('Email already exists'));
    }

    const otp = createOtp()
    const subject = 'user verification'
    const html = template(otp, name, subject)

    const mail = await sendMail(email, subject, html)

    if(mail instanceof Error){
        return next(new ErrorHandler('could not send mail'));
    }

    const newUser = await DBservices.create(
        UserModel, {
             name,
             email,
             password,
             phone,
             age,
             otp:{
                code: otp,
                expiresAt: Date.now() + 1000 * 60 * 2 // 2 minutes
             }
            }
    );

    return successHandler(res, { user: newUser }, 'User added successfully', 201);
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ValidationError('Email and password are required'));
    }
    const user = await DBservices.findOne(UserModel, { email } );
    if(!user){
        return next(new UnauthorizedError('Invalid email or password'));
    }

    if(user && user.provider !== Providers.system && !user.password){
       user.provider = Providers.system;
       user.password = password;
       await user.save();
       return next(new UnauthorizedError('Login again using same credentials'));
    }
    const isPasswordValid = compareHash(password, user.password);

    if (!isPasswordValid) {
        return next(new UnauthorizedError('Invalid email or password'));
    } 
    const access_token = jwt.sign({ id: user._id}, process.env.ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN }); 
    const refresh_token = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });  
    return successHandler(res, { access_token: access_token, refresh_token: refresh_token  }, 'login successful');
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
            provider: Providers.google,
            providerId: payload.sub
        });
    } else if (user.provider !== Providers.google) {
        user.provider = Providers.google;
        user.providerId = payload.sub;
        await user.save();
    }
    const access_token = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN });
    const refresh_token = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });
    return successHandler(res, { access_token, refresh_token }, 'Social login successful'); 

}

