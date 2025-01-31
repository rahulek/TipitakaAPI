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

router.get('/paras', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const subSectionId = req.query.subSectionId;
    if (!subSectionId) {
      return res.status(404).end();
    }
    const paras = await tipitakaService.getParas(subSectionId);

    res.json(paras);
  } catch (e) {
    next(e);
  }
});

router.get('/subParas', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const paraId = req.query.paraId;
    if (!paraId) {
      return res.status(404).end();
    }
    const subParas = await tipitakaService.getSubParas(paraId);

    res.json(subParas);
  } catch (e) {
    next(e);
  }
});

router.get('/allLines', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const paraId = req.query.paraId;
    if (!paraId) {
      return res.status(404).end();
    }
    const allLines = await tipitakaService.getAllLines(paraId);

    res.json(allLines);
  } catch (e) {
    next(e);
  }
});

router.get('/allLineIdRepeats', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const lineId = req.query.lineId;
    if (!lineId) {
      return res.status(404).end();
    }
    const allRepeats = await tipitakaService.getRepeatCountFromLineId(lineId);

    res.json(allRepeats);
  } catch (e) {
    next(e);
  }
});

router.get('/allLineTextRepeats', async (req, res, next) => {
  try {
    const driver = getDriver();

    const tipitakaService = new TipitakaService(driver);
    const lineText = req.query.lineText;
    const clause = req.query.clause || 'exact';
    if (!lineText) {
      return res.status(404).end();
    }
    const allRepeats = await tipitakaService.getRepeatCountFromLineText(
      lineText,
      clause
    );

    res.json(allRepeats);
  } catch (e) {
    next(e);
  }
});

export default router;
