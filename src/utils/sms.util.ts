import twilio from 'twilio';
import { env } from '../config/env';
import logger from '../config/logger';

/** Lazy-initialized Twilio client (only created if credentials are provided) */
const client =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

/**
 * Send an SMS message via Twilio.
 * Falls back to console logging if Twilio is not configured (development).
 * @param phone - Recipient phone number in E.164 format
 * @param message - SMS message body
 */
export const sendSMS = async (phone: string, message: string): Promise<void> => {
  if (!client || !env.TWILIO_PHONE_NUMBER) {
    logger.warn('Twilio not configured — SMS not sent. Logging to console instead.');
    console.log(`📱 [DEV SMS] To: ${phone} | Message: ${message}`);
    return;
  }

  try {
    await client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    logger.info(`SMS sent to ${phone}`);
  } catch (error) {
    logger.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
};
