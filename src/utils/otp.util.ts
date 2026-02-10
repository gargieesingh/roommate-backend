import crypto from 'crypto';

/**
 * Generate a cryptographically secure random OTP of the given length.
 * Uses crypto.randomInt for uniform distribution (no modulo bias).
 * @param length - Number of digits in the OTP (default: 6)
 * @returns A string of random digits, e.g. "038291"
 */
export const generateOTP = (length: number = 6): string => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
};
