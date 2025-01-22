/* eslint-disable semi */
import { Router } from 'express';

import auth from './auth.routes.js';
import account from './account.routes.js';
import status from './status.routes.js';
const router = new Router();

router.use('/auth', auth);
router.use('/account', account);
router.use('/status', status);

export default router;
