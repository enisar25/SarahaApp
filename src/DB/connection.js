import mongoose from "mongoose";

// src/DB/connection.js
// This file establishes a connection to the MongoDB database using Mongoose ODM.

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit with failure
    }
};

export default connectDB;