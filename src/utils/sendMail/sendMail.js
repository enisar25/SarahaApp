import { customAlphabet } from "nanoid";
import nodemailer from "nodemailer";

// src/utils/sendMail/sendMail.js
// Utility function to send emails using nodemailer

export const sendMail = async (to, subject, html) => {
  // Create reusable transporter object
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, 
    port: 587,
    secure: false, // true for 465
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `sarahaApp <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Message sent:", info.messageId);
    return info;
    
  } catch (err) {
    console.error("Error sending mail:", err);
    return err
  }
};

export const createOtp = () => {
    const custom = customAlphabet('0123456789')
    const otp  = custom(6)
    return otp 
  }
