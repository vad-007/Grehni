// This file assumes CryptoJS is loaded globally from a script tag in index.html
declare const CryptoJS: any;

const SALT = "a_very_strong_and_unique_salt_for_grehni_app"; // In a real app, this would be unique per user

// Derives a key from a password using PBKDF2
export const deriveKey = (password: string): string => {
  const key = CryptoJS.PBKDF2(password, SALT, {
    keySize: 256 / 32,
    iterations: 1000
  });
  return key.toString();
};

// Encrypts a string using AES
export const encrypt = async (plainText: string, key: string): Promise<string> => {
    try {
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Hex.parse(key), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        // Return IV + ciphertext, base64 encoded
        return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
    } catch (e) {
        console.error("Encryption failed:", e);
        throw e;
    }
};

// Decrypts a string using AES
export const decrypt = async (cipherText: string, key: string): Promise<string> => {
    try {
        const parts = cipherText.split(':');
        const iv = CryptoJS.enc.Base64.parse(parts[0]);
        const encryptedData = parts[1];
        
        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(key), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (!result) {
            throw new Error("Decryption resulted in empty string. Wrong key?");
        }
        return result;
    } catch (e) {
        console.error("Decryption failed. The key might be wrong or the data corrupted.", e);
        throw new Error("Decryption failed");
    }
};

// Hashes data using SHA256
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};