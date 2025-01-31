/* eslint-disable semi */

export default class TipitakaService {
  driver;

  constructor(driver) {
    this.driver = driver;
  }

  sorted(collection) {
    const compareFn = (a, b) => {
      const tempA = a.id.substring(2).split('_');
      const aID = parseInt(tempA[tempA.length - 1]);

      const tempB = b.id.substring(2).split('_');
      const bID = parseInt(tempB[tempB.length - 1]);

      //console.log(`OUT: ${aID}, ${bID}`);

      if (aID < bID) return -1;
      if (aID > bID) return 1;

      return 0;
    };

    return collection.sort(compareFn);
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

    return this.sorted(
      res.records.map((rec) => {
        const name = rec.get('b.name');
        const id = rec.get('b.id');
        return { name, id };
      })
    );
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

    return this.sorted(
      res.records.map((rec) => {
        const bookName = rec.get('b.name');
        const id = rec.get('ne.id');
        const name = rec.get('ne.name');
        return { bookName, id, name };
      })
    );
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

    return this.sorted(
      res.records.map((rec) => {
        const sectionName = rec.get('ne.name');
        const id = rec.get('ss.id');
        const subSectionName = rec.get('ss.name');
        return { sectionName, id, subSectionName };
      })
    );
  }

  async getParas(subSectionId) {
    // Open a new session
    const session = this.driver.session();

    const res = await session.executeRead((tx) =>
      tx.run(
        'MATCH (s :SUBSECTION {id: $subSectionId})-[:HAS_PARA]-(p :PARA) RETURN s.id, p.id, p.text',
        {
          subSectionId,
        }
      )
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    const paras = this.sorted(
      res.records.map((rec) => {
        const subSectionId = rec.get('s.id');
        const id = rec.get('p.id');
        const text = rec.get('p.text');
        return { subSectionId, id, text };
      })
    );

    return { numParas: paras.length, paras };
  }

  async getSubParas(paraId) {
    // Open a new session
    const session = this.driver.session();

    const res = await session.executeRead((tx) =>
      tx.run(
        'MATCH (p :PARA {id: $paraId})-[:HAS_SUBPARA]-(sp :SUBPARA) RETURN p.id, sp.id, sp.text',
        {
          paraId,
        }
      )
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    const subParas = this.sorted(
      res.records.map((rec) => {
        const paraId = rec.get('p.id');
        const id = rec.get('sp.id');
        const text = rec.get('sp.text');
        return { paraId, id, text };
      })
    );

    return { numSubParas: subParas.length, subParas };
  }

  async getAllLines(paraId) {
    // Open a new session
    const session = this.driver.session();

    const qText = `
      MATCH (p :PARA {id: $paraId})-[:HAS_LINE]-(lid :LINEID)-[:LINETEXT]-(l :LINE) 
      RETURN lid.id,  l.text 
      UNION
      MATCH (p :PARA {id: $paraId})-[:HAS_SUBPARA]-(sp :SUBPARA)-[:HAS_LINE]-(lid :LINEID)-[:LINETEXT]-(l :LINE) 
      RETURN lid.id, l.text 
    `;
    const res = await session.executeRead((tx) =>
      tx.run(qText, {
        paraId,
      })
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    const allLines = this.sorted(
      res.records.map((rec) => {
        const id = rec.get('lid.id');
        const lineText = rec.get('l.text');
        return { id, lineText };
      })
    );

    return { numLines: allLines.length, allLines };
  }

  async getRepeatCountFromLineId(lineId) {
    // Open a new session
    const session = this.driver.session();

    const qText = `
      MATCH (lid :LINEID {id: $lineId})-[:LINETEXT]-(lt :LINE)<-[r]-(lid2 :LINEID) 
      RETURN lid2.id, lt.text
    `;
    const res = await session.executeRead((tx) =>
      tx.run(qText, {
        lineId,
      })
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    const allRepeats = this.sorted(
      res.records.map((rec) => {
        const id = rec.get('lid2.id');
        const lineText = rec.get('lt.text');
        return { id, lineText };
      })
    );

    return { numRepeats: allRepeats.length, allRepeats };
  }

  async getRepeatCountFromLineText(lineText, clause) {
    // Open a new session
    const session = this.driver.session();

    const qTextExact = `
      MATCH (lid :LINEID)-[:LINETEXT]-(lt :LINE) WHERE lt.text = $lineText 
      RETURN lid.id, lt.text
    `;

    const qTextContains = `
      MATCH (lid :LINEID)-[:LINETEXT]-(lt :LINE) WHERE lt.text CONTAINS $lineText 
      RETURN lid.id, lt.text
    `;

    let qText = qTextExact;
    if (clause === 'contains') {
      qText = qTextContains;
    }

    const res = await session.executeRead((tx) =>
      tx.run(qText, {
        lineText,
      })
    );

    // Close the session, data already fetched, no session required anymore
    await session.close();

    const allRepeats = this.sorted(
      res.records.map((rec) => {
        const id = rec.get('lid.id');
        const lineText = rec.get('lt.text');
        return { id, lineText };
      })
    );

    return { numRepeats: allRepeats.length, allRepeats };
  }
}
