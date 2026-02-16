import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { env } from './env';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * Configure Passport.js with Google OAuth 2.0 Strategy
 */
export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const firstName = profile.name?.givenName;
          const lastName = profile.name?.familyName;
          const profilePhoto = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Find or create user
          const user = await authService.findOrCreateGoogleUser({
            googleId,
            email,
            firstName,
            lastName,
            profilePhoto,
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize user for session (not used with JWT, but required by Passport)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (not used with JWT, but required by Passport)
  passport.deserializeUser((id: string, done) => {
    done(null, { id });
  });
};
