import fs from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

const options = {
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    parseTagValue: true,
    trimValues: true
};

async function convert() {
        const xmlData = await fs.readFile('voetreflextherapieantinebreimer.WordPress.2026-05-16.xml', 'utf8');
        const parser = new XMLParser(options);
        const jsonObj = parser.parse(xmlData);
        //const items = jsonObj.rss?.channel?.item || [];
        const items = jsonObj.rss || [];
        await fs.writeFile('output.json', JSON.stringify(items, null, 2));
}

convert();