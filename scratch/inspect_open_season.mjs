import fs from 'fs';

const db = JSON.parse(fs.readFileSync('./src/data/cartoons_db.json', 'utf8'));

const matches = db.filter(m => {
  const t = (m.titleEnglish || m.titleBosnian || m.rawTitle || '').toLowerCase();
  return t.includes('open season') || t.includes('sezona lova');
});

console.log('Matches found:', matches.length);
matches.forEach(m => {
  console.log('Title:', m.titleEnglish, '|', m.titleBosnian);
  console.log('Source site:', m.sourceSite);
  console.log('Source URL:', m.sourceUrl);
  console.log('Stream URL:', m.streamUrl);
  console.log('Servers:', JSON.stringify(m.servers, null, 2));
});
