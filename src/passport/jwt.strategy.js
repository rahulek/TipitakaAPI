/* eslint-disable semi */
import { config } from 'dotenv';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWT_SECRET } from '../constants.js';
import { getDriver } from '../neo4j.js';
import AuthService from '../services/auth.service.js';

config();

export const JwtStrategy = new Strategy(
  {
    secretOrKey: JWT_SECRET, // Secret for encoding/decoding the JWT token
    ignoreExpiration: true, // Ignoring the expiration date of a token may not be the best idea in a production environment
    passReqToCallback: true, // Passing the request to the callback allows us to use the open transaction
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (req, claims, done) => {
    const driver = getDriver();
    const authService = new AuthService(driver);

    return done(null, await authService.claimsToUser(claims));
  }
);
