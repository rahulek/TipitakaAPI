/* eslint-disable semi */
import { Router } from 'express';
import passport from 'passport';
import { getDriver } from '../neo4j.js';
import { getPagination, getUserId } from '../utils.js';

const router = new Router();

/**
 * Require jwt authentication for these routes
 */
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @GET /account/
 *
 * This route simply returns the claims made in the JWT token
 */
router.get('/', (req, res, next) => {
  try {
    res.json(req.user);
  } catch (e) {
    next(e);
  }
});

export default router;
