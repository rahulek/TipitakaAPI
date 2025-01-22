/* eslint-disable semi */
import { Strategy } from 'passport-local';
import { getDriver } from '../neo4j.js';
import { user } from '../../test/fixtures/users.js';
import AuthService from '../services/auth.service.js';

export const Neo4jStrategy = new Strategy(
  {
    usernameField: 'email', // Use email address as username field
    session: false, // Session support is not necessary
    passReqToCallback: true, // Passing the request to the callback allows us to use the open transaction
  },
  async (req, email, password, done) => {
    const driver = getDriver();
    const service = new AuthService(driver);

    const user = await service.authenticate(email, password);

    done(null, user);
  }
);
