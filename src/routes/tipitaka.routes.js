/* eslint-disable semi */
import { Router } from 'express';
import passport from 'passport';
import { getDriver } from '../neo4j.js';
import TipitakaService from '../services/tipitaka.service.js';

const router = new Router();

//router.use(passport.authenticate('jwt', { session: false }));

router.get('/pitakas', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const pitakas = await tipitakaService.getPitakas();

    res.json(pitakas);
  } catch (e) {
    next(e);
  }
});

router.get('/books', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const collection = req.query.collection;
    if (!collection) {
      return res.status(404).end();
    }
    const pitakas = await tipitakaService.getBooks(collection);

    res.json(pitakas);
  } catch (e) {
    next(e);
  }
});

router.get('/sections', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const bookId = req.query.book;
    if (!bookId) {
      return res.status(404).end();
    }
    const sections = await tipitakaService.getSections(bookId);

    res.json(sections);
  } catch (e) {
    next(e);
  }
});

router.get('/subsections', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const sectionId = req.query.section;
    if (!sectionId) {
      return res.status(404).end();
    }
    const subSections = await tipitakaService.getSubSections(sectionId);

    res.json(subSections);
  } catch (e) {
    next(e);
  }
});

export default router;
