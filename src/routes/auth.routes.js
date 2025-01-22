/* eslint-disable semi */
import { Router } from 'express';
import passport from 'passport';
import { getDriver } from '../neo4j.js';
import AuthService from '../services/auth.service.js';

const router = new Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('HERE');
  res.json(req.user);
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const driver = getDriver();

    const authService = new AuthService(driver);
    const output = await authService.register(email, password, name);

    res.json(output);
  } catch (e) {
    next(e);
  }
});

export default router;
