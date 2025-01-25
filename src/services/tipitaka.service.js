/* eslint-disable semi */

export default class TipitakaService {
  driver;

  constructor(driver) {
    this.driver = driver;
  }

  async getPitakas() {
    // Open a new session
    const session = this.driver.session();

    const res = await session.executeRead((tx) =>
      tx.run('MATCH (p :PITAKA) RETURN p.name')
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    return res.records.map((rec) => {
      return rec.get('p.name');
    });
  }

  async getBooks(collectionName) {
    // Open a new session
    const session = this.driver.session();

    const res = await session.executeRead((tx) =>
      tx.run(
        'MATCH (n :NIKAYA {name: $collectionName})-[:HAS_BOOK]-(b :BOOK) RETURN b.name, b.id',
        {
          collectionName,
        }
      )
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    return res.records.map((rec) => {
      const name = rec.get('b.name');
      const id = rec.get('b.id');
      return { name, id };
    });
  }

  async getSections(bookId) {
    // Open a new session
    const session = this.driver.session();

    const res = await session.executeRead((tx) =>
      tx.run(
        'MATCH (b :BOOK {id:$bookId})-[:NIKAYA_ENTRY]-(ne :NIKAYAENTRY) RETURN b.name, ne.id, ne.name',
        {
          bookId,
        }
      )
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    return res.records.map((rec) => {
      const bookName = rec.get('b.name');
      const id = rec.get('ne.id');
      const name = rec.get('ne.name');
      return { bookName, id, name };
    });
  }

  async getSubSections(sectionId) {
    // Open a new session
    const session = this.driver.session();

    const res = await session.executeRead((tx) =>
      tx.run(
        'MATCH (ne :NIKAYAENTRY {id:$sectionId})-[]-(ss :SUBSECTION) RETURN ne.name, ss.name, ss.id',
        {
          sectionId,
        }
      )
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    return res.records.map((rec) => {
      const sectionName = rec.get('ne.name');
      const subSectionId = rec.get('ss.id');
      const subSectionName = rec.get('ss.name');
      return { sectionName, subSectionId, subSectionName };
    });
  }
}
