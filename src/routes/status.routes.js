/* eslint-disable semi */
import { Router } from 'express';
import { getDriver } from '../neo4j.js';

const router = new Router();

router.get('/', (req, res) => {
  let driver = getDriver() !== undefined;
  let transactions = req.transaction !== undefined;
  let register = false;
  let handleConstraintErrors = false;
  let authentication = false;
  let apiPrefix = process.env.API_PREFIX;

  res.json({
    status: 'OK',
    driver,
    transactions,
    register,
    handleConstraintErrors,
    authentication,
    apiPrefix,
  });
});

export default router;
