import jwt from 'jsonwebtoken';
import * as DBservices from '../DB/DBservices.js';
import UserModel from '../DB/models/user.model.js';

export const auth = () => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check header
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      // Look up user
      const user = await DBservices.findById(UserModel, decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      if ( user.credentialsChangedAt && user.credentialsChangedAt > new Date(decoded.iat * 1000)) {
        return res.status(401).json({ message: 'Token is invalid due to password change' });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};
