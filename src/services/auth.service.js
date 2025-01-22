/* eslint-disable semi */
import jwt from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import ValidationError from '../errors/validation.error.js';
import { JWT_SECRET, SALT_ROUNDS } from '../constants.js';

export default class AuthService {
  driver;

  constructor(driver) {
    this.driver = driver;
  }

  async register(email, plainPassword, name) {
    // Open a new session
    const session = this.driver.session();

    const encrypted = await hash(plainPassword, parseInt(SALT_ROUNDS));

    // Handle Unique constraints in the database

    try {
      const res = await session.executeWrite((tx) =>
        tx.run(
          `
            CREATE (u :User {
              userId: randomUuid(),
              email: $email,
              password: $encrypted,
              name: $name
            }) 
            RETURN u
          `,
          {
            email,
            encrypted,
            name,
          }
        )
      );

      // Extract the user from the result
      const [first] = res.records;
      const node = first.get('u');

      const { password, ...safeProperties } = node.properties;

      // Close the session
      await session.close();

      return {
        ...safeProperties,
        token: jwt.sign(this.userToClaims(safeProperties), JWT_SECRET),
      };
    } catch (e) {
      if (e.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
        throw new ValidationError(
          `An account already exists with the email address ${email}`,
          {
            email: 'Email address already taken',
          }
        );
      }

      throw e;
    } finally {
      await session.close();
    }
  }

  async authenticate(email, unencryptedPassword) {
    // Authenticate the user from the database

    // Open a New Session
    const session = this.driver.session();
    const res = await session.executeRead((tx) =>
      tx.run('MATCH (u :User {email: $email}) RETURN u', { email })
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    // Verify the user exists
    if (res.records.length === 0) {
      // Use does not exist, not authenticated
      return false;
    }

    // Compare the passwords
    const user = res.records[0].get('u');
    const encryptedPassword = user.properties.password;

    const correct = await compare(unencryptedPassword, encryptedPassword);
    if (correct === false) {
      return false;
    }

    const { password, ...safeProperties } = user.properties;

    return {
      ...safeProperties,
      token: jwt.sign(this.userToClaims(safeProperties), JWT_SECRET),
    };
  }

  userToClaims(user) {
    const { name, userId } = user;

    return { sub: userId, userId, name };
  }

  async claimsToUser(claims) {
    return {
      ...claims,
      userId: claims.sub,
    };
  }
}
