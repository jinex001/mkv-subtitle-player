// node tests/encoding.test.cjs — every fixture must be detected as the encoding in its file name
// (fixtures are made by tests/make-fixtures.py: <lang>.<encoding>.srt)
const fs = require('fs'), path = require('path');
const { detect } = require('../web/encoding.js');
const dir = path.join(__dirname, 'fixtures');
let fail = 0;
for (const prefs of [[], ['en-US'], ['ko-KR'], ['de-DE'], ['ja-JP'], ['ru-RU']]) {
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.srt')).sort()) {
    const want = f.split('.')[1];
    const r = detect(fs.readFileSync(path.join(dir, f)), prefs);
    // same text = fine (e.g. Hungarian without ő/ű is identical in 1250 and 1252)
    const ok = r.encoding === want || r.text === new TextDecoder(want).decode(fs.readFileSync(path.join(dir, f)));
    if (!ok) fail++;
    if (!ok || prefs.length === 0) {
      console.log(`${ok ? 'ok  ' : 'FAIL'} [${prefs}] ${f.padEnd(24)} -> ${r.encoding} (${r.score.toFixed(2)})` +
        (ok ? '' : '  ' + r.ranked.slice(0, 3).map(x => x.enc + ' ' + x.score.toFixed(2)).join(', ')));
    }
  }
}
console.log(fail ? `${fail} failed` : 'all passed');
process.exit(fail ? 1 : 0);
