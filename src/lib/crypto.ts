import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.RDP_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("RDP_ENCRYPTION_KEY environment variable is not set");
  }
  return Buffer.from(key, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a hex string: iv + authTag + ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv (hex) + authTag (hex) + ciphertext (hex)
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

/**
 * Decrypt a string that was encrypted with encrypt().
 * Expects hex string: iv + authTag + ciphertext
 */
export function decrypt(encrypted: string): string {
  const key = getEncryptionKey();

  const ivHex = encrypted.slice(0, IV_LENGTH * 2);
  const authTagHex = encrypted.slice(
    IV_LENGTH * 2,
    IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2
  );
  const ciphertext = encrypted.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
