import e from "express";
import mongoose from "mongoose";

// src/DB/models/user.model.js
// Mongoose schema and model for users

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
       return this.provider === 'system';
      },
    },
    phone: {
      type: String,
      required: false,
    },
    age: {
      type: Number,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      required: false,
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
      enum: ['system', 'google'],
      default: 'system',
    },
    providerId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "users", // Collection name
  }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
