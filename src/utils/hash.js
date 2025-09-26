import bycrypt from 'bcryptjs';
const saltRounds = Number(process.env.SALTROUNDS) || 10;

export const hash = (plainText) => {
    const hashed =  bycrypt.hashSync(plainText, saltRounds);
    return hashed;
}

export const compareHash = (plainText, hashed) => {
    const isMatch =  bycrypt.compareSync(plainText, hashed);
    return isMatch;
}

// src/utils/hash.js
