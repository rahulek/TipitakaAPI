/* eslint-disable semi */
import neo4j from 'neo4j-driver';

let driver;

export async function initDriver(uri, username, password) {
  driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

  // eslint-disable-next-line no-useless-catch
  try {
    await driver.verifyAuthentication();
  } catch (e) {
    throw e;
  }

  return driver;
}

export function getDriver() {
  return driver;
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
  }
}
