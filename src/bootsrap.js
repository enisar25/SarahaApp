import connectDB  from './DB/connection.js';
import authRouter from './modules/authModule/auth.controller.js';
import userRouter from './modules/userModule/user.controller.js';
import messageRouter from './modules/messageModule/message.controller.js';
import "dotenv/config.js";
import cors from 'cors';
import { uploadFileLocal } from './utils/multer/multer.local.js';

// src/bootstrap.js
// This file initializes the Express application, connects to the database, and sets up routes.

const bootstrap = (app,express) => {

    // Middleware to parse JSON and URL-encoded data
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    const PORT = process.env.PORT || 3000;

    // Connect to the database
    connectDB()

    // CORS configuration
    app.use(cors())

    // File upload endpoint for testing
    app.post('/upload-file', uploadFileLocal().single('file'), (req, res) => {
    console.log('req.file:', req.file);
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file received' });
    res.json({ ok: true, file: req.file });
    });

    //set up routes
    app.use('/uploads', express.static('uploads'));
    app.use('/auth', authRouter);
    app.use('/users', userRouter);
    app.use('/messages', messageRouter);

    // 404 handler
    app.all('/{*any}', (req, res) => {
    return res.status(404).json({message: `url: '${req.originalUrl}
        ' with method: '${req.method}' not found`, status: 404 });
    });

    // Global error handling middleware
    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            status: 'error',
            statusCode,
            message: err.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        });     
    });
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default bootstrap;