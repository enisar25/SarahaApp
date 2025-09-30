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
    otp: {
      type: String,
      required: false,
      set(value){
        return hash(value)
      }
    },
    otpExpiresAt: {
      type: Date,
      required: false,
    },
    otpAttempts: {
      type: Number,
      default: function () { if (this.provider === 'system') return 0;
         else return undefined; },
    },
    otplockUntil: {
      type: Date,
      required: false,
    },
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
