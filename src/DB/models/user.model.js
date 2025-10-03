import mongoose from "mongoose";
import { encrypt, decrypt } from "../../utils/encryption.js";
import { hash } from "../../utils/hash.js"

// src/DB/models/user.model.js
// Mongoose schema and model for users

export const Gender = {
  male: 'male',
  female: 'female',
}
Object.freeze(Gender)
export const Roles = {
  user: 'user',
  admin: 'admin',
}
Object.freeze(Roles)
export const Providers = {
  system: 'system',
  google: 'google',
}
Object.freeze(Providers)

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    set(value){
      return hash(value)
    }
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  resendAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    required: false,
  }},
   {
    _id: false
   },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
       return this.provider === Providers.system;
      },
      set(value){
        return hash(value)
      }
    },
    phone: {
      type: String,
      required: false,
      set(value) {
        return encrypt(value)
      },
      get(value) {
        return decrypt(value)
      },
    },
    age: {
      type: Number,
      required: false,
    },
    role:{
      type: String,
      enum: Object.values(Roles),
      default: Roles.user
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: otpSchema,

    resetPasswordOtp: otpSchema,

    resetEmailOtp: otpSchema,

    newEmailOtp: otpSchema,

    credentialsChangedAt: {
      type: Date,
      required: false,
    },
    provider: {
      type: String,
      enum: Object.values(Providers),
      default: Providers.system,
    },
    providerId: {
      type: String,
      required: false,
    },
    deleted: {
      deletedAt: {
         type: Date,
         default: null
         },
      deletedBy: {
         type : ObjectId,
          default: null
        } 
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "users", // Collection name
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
  }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
