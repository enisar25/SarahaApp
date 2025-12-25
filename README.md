# SarahaApp 📨

A Sarahah-style anonymous feedback web application built with Node.js, Express, and MongoDB. Share your profile link and receive honest, anonymous messages from others while maintaining full control over your messages.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## ✨ Features

### Authentication & Authorization
- **User Registration & Login** - Secure signup and login with email verification
- **Email Verification** - OTP-based email confirmation system
- **Password Management** - Forget password and reset password functionality
- **Social Login** - Google OAuth integration
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - User and Admin roles

### User Management
- **Profile Management** - Update user profile information
- **Profile Images** - Upload and manage profile pictures (Cloudinary integration)
- **Cover Images** - Upload multiple cover images (up to 5)
- **Profile Sharing** - Generate shareable profile links
- **User Search** - View all users (admin only)
- **Soft Delete** - Soft delete users with restore functionality (admin only)

### Messaging System
- **Anonymous Messaging** - Send anonymous messages to users
- **Message Management** - View, retrieve, and delete messages
- **Message History** - Track all received messages with timestamps

### Security & Performance
- **Rate Limiting** - Prevent abuse with request rate limiting
- **Helmet.js** - Security headers for Express
- **Data Encryption** - Encrypted sensitive data (phone numbers)
- **Password Hashing** - Bcrypt password hashing
- **Input Validation** - Joi schema validation
- **Error Handling** - Comprehensive error handling middleware
- **CORS** - Cross-origin resource sharing configuration

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.0.0
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **File Upload**: Multer with Cloudinary
- **Security**: Helmet, CORS, express-rate-limit
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs
- **Encryption**: crypto-js
- **Logging**: Morgan
- **Social Auth**: google-auth-library

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **npm** or **yarn** package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SarahaApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section)

4. **Start the server**
   ```bash
   npm test
   ```
   Note: The `test` script runs the server with watch mode. For production, you may want to use a process manager like PM2.

   The server will start on `http://localhost:3000` (or the port specified in your `.env` file)

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sarahaapp
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sarahaapp

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@sarahaapp.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Encryption Key (for sensitive data)
ENCRYPTION_KEY=your_32_character_encryption_key
```

## 📁 Project Structure

```
SarahaApp/
├── index.js                 # Application entry point
├── package.json             # Dependencies and scripts
├── src/
│   ├── bootsrap.js         # Application initialization
│   ├── DB/
│   │   ├── connection.js   # MongoDB connection
│   │   ├── DBservices.js   # Database services
│   │   └── models/
│   │       ├── user.model.js    # User schema
│   │       └── message.model.js # Message schema
│   ├── middlewares/
│   │   ├── auth.middleware.js      # Authentication middleware
│   │   ├── validation.middleware.js # Validation middleware
│   │   └── storeFile.middleware.js  # File storage middleware
│   ├── modules/
│   │   ├── authModule/
│   │   │   ├── auth.controller.js    # Auth routes
│   │   │   ├── auth.service.js       # Auth business logic
│   │   │   ├── auth.validation.js    # Auth validation schemas
│   │   │   ├── email.service.js      # Email services
│   │   │   ├── password.service.js   # Password services
│   │   │   └── verifyGoogle.js       # Google OAuth verification
│   │   ├── userModule/
│   │   │   ├── user.controller.js    # User routes
│   │   │   ├── user.service.js       # User business logic
│   │   │   └── user.validation.js    # User validation schemas
│   │   └── messageModule/
│   │       ├── message.controller.js # Message routes
│   │       └── message.service.js    # Message business logic
│   └── utils/
│       ├── encryption.js          # Data encryption utilities
│       ├── hash.js                # Hashing utilities
│       ├── errorHandler.js        # Error handling
│       ├── succesHandler.js       # Success response handler
│       ├── general.validation.js  # General validation
│       ├── multer/
│       │   ├── multer.cloud.js    # Cloudinary upload config
│       │   ├── multer.local.js    # Local upload config
│       │   ├── cloudConfig.js      # Cloudinary configuration
│       │   └── cloudServices.js   # Cloudinary services
│       └── sendMail/
│           ├── sendMail.js        # Email sending service
│           └── createHtml.js     # HTML email templates
└── uploads/                 # Local file uploads (if using local storage)
```

## 🔌 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/confirm-email` | Confirm email with OTP | Yes |
| POST | `/auth/resend-otp` | Resend OTP code | Yes |
| POST | `/auth/get-access-token` | Get new access token | No |
| POST | `/auth/forget-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with OTP | No |
| POST | `/auth/social-login` | Login with Google | No |
| POST | `/auth/request-email-update` | Request email update | Yes |
| POST | `/auth/confirm-email-update` | Confirm email update with OTP | Yes |

### Users (`/users`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users/all` | Get all users | Yes | Any |
| GET | `/users/:id` | Get user by ID | No | - |
| GET | `/users/share-profile` | Get shareable profile link | Yes | Any |
| PATCH | `/users/` | Update user profile | Yes | Any |
| DELETE | `/users/` | Delete own account | Yes | Any |
| PATCH | `/users/profile-image` | Upload profile image | Yes | Any |
| GET | `/users/profile-image` | Get profile image | Yes | Any |
| PATCH | `/users/cover-images` | Upload cover images (max 5) | Yes | Any |
| DELETE | `/users/soft-delete/:id` | Soft delete user | Yes | Admin |
| POST | `/users/restore/:id` | Restore soft-deleted user | Yes | Admin |

### Messages (`/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages/send/:from` | Send anonymous message | No |
| GET | `/messages/` | Get all messages for user | Yes |
| GET | `/messages/:id` | Get message by ID | Yes |
| DELETE | `/messages/:id` | Delete message | Yes |

### File Upload (`/upload-file`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload-file` | Test file upload endpoint | No |

## 💻 Usage

### Starting the Development Server

```bash
npm test
```

The server runs with watch mode, automatically restarting on file changes.

### Example API Requests

#### 1. Register a New User

```bash
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "+1234567890",
  "age": 25
}
```

#### 2. Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

#### 3. Send Anonymous Message

```bash
POST /messages/send/:userId
Content-Type: application/json

{
  "content": "Your anonymous message here"
}
```

#### 4. Get All Messages (Authenticated)

```bash
GET /messages/
Authorization: Bearer <your_jwt_token>
```

#### 5. Upload Profile Image

```bash
PATCH /users/profile-image
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data

profileImage: <file>
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Data Encryption** - Sensitive data (phone numbers) encrypted at rest
- **Rate Limiting** - Prevents brute force attacks
- **Helmet.js** - Security headers
- **Input Validation** - Joi schema validation for all inputs
- **CORS** - Configurable cross-origin resource sharing
- **OTP System** - Time-limited OTP codes with attempt limits
- **Email Verification** - Required for account activation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Mohammed Enisar**

---

## 📚 Additional Notes

- The application uses ES6 modules (`"type": "module"` in package.json)
- File uploads are configured to use Cloudinary by default, but local storage option is available
- The application supports both local MongoDB and MongoDB Atlas
- Email functionality requires proper SMTP configuration
- Google OAuth requires Google Cloud Console setup

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - Verify network connectivity for cloud instances

2. **Email Not Sending**
   - Verify SMTP credentials in `.env`
   - For Gmail, use App Password instead of regular password
   - Check firewall/network restrictions

3. **Cloudinary Upload Fails**
   - Verify Cloudinary credentials in `.env`
   - Check file size limits
   - Ensure proper image format

4. **JWT Token Issues**
   - Verify `JWT_SECRET` is set in `.env`
   - Check token expiration settings
   - Ensure token is sent in Authorization header

---

