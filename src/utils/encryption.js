import CryptoJS from "crypto-js";

export const encrypt = (plainText) => {
    const cipherText = CryptoJS.AES.encrypt(plainText, process.env.ENCRYPTION_KEY).toString();
    return cipherText;
}

export const decrypt = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, process.env.ENCRYPTION_KEY);
    const plainText = bytes.toString(CryptoJS.enc.Utf8);
    return plainText;
}

// src/utils/encryption.js
