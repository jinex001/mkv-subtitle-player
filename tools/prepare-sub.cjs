// node tools/prepare-sub.cjs <subtitle file> <output dir> <prefix>
// Writes UTF-8 copies of a subtitle file for ffmpeg and prints one "path|language" line per output.
// - any legacy encoding is detected with web/encoding.js
// - SMI (SAMI) is converted to SRT, one file per language class (ffmpeg's own SAMI reader merges them)
'use strict';
const fs = require('fs'), path = require('path');
const E = require(path.join(__dirname, '..', 'web', 'encoding.js'));
const [src, outDir, prefix] = process.argv.slice(2);
const pref = [(process.env.LANG || '').split('.')[0].replace('_', '-')].filter(Boolean);
const r = E.detect(fs.readFileSync(src), pref);
if (r.encoding !== 'utf-8') console.error(`  ${path.basename(src)}: ${r.encoding} -> UTF-8`);
const text = r.text.replace(/^﻿/, '');
const ext = path.extname(src).toLowerCase();

if (ext !== '.smi' && ext !== '.sami' && !/<sync\b/i.test(text.slice(0, 20000))) {
  const out = path.join(outDir, prefix + ext);
  fs.writeFileSync(out, text);
  console.log(out + '|');
  process.exit(0);
}

const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? m));
const CLASS = { kr: 'ko', ko: 'ko', en: 'en', eg: 'en', us: 'en', jp: 'ja', ja: 'ja', cn: 'zh', zh: 'zh', es: 'es', fr: 'fr', de: 'de', ge: 'de', ru: 'ru' };
const info = {};
const style = (text.match(/<style[\s\S]*?<\/style>/i) || [''])[0];
for (const m of style.matchAll(/\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g)) {
  const lang = (m[2].match(/lang\s*:\s*([^;]+)/i) || [])[1];
  info[m[1].toLowerCase()] = lang && lang.trim().split('-')[0].toLowerCase();
}
const byCls = {}, order = [];
for (const m of text.replace(/\r/g, '').matchAll(/<sync\b[^>]*\bstart\s*=\s*["']?(-?\d+)[^>]*>([\s\S]*?)(?=<sync\b|<\/body>|$)/gi)) {
  const t = +m[1];
  const parts = [...m[2].matchAll(/<p\b([^>]*)>([\s\S]*?)(?=<p\b|$)/gi)].map(p =>
    [((p[1].match(/class\s*=\s*["']?([A-Za-z0-9_-]+)/i) || [])[1] || 'default').toLowerCase(), p[2]]);
  if (!parts.length) parts.push(['default', m[2]]);
  for (const [cls, raw] of parts) {
    const s = decode(raw.replace(/<br\s*\/?>/gi, '\n').replace(/<(?!\/?[ibu]\b)[^>]*>/gi, ''))
      .replace(/[ \t]+/g, ' ').split('\n').map(l => l.trim()).filter(Boolean).join('\n');
    if (!byCls[cls]) { byCls[cls] = []; order.push(cls); }
    const list = byCls[cls], prev = list[list.length - 1];
    if (prev && prev.e == null) prev.e = t;
    if (s.replace(/<[^>]*>/g, '').trim()) list.push({ s: t, e: null, t: s });
  }
}
const ts = ms => { ms = Math.max(0, Math.round(ms)); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
order.forEach((cls, i) => {
  const cues = byCls[cls].map(c => ({ ...c, e: c.e == null ? c.s + 4000 : c.e })).filter(c => c.e > c.s);
  if (!cues.length) return;
  const out = path.join(outDir, `${prefix}-${i}.srt`);
  fs.writeFileSync(out, cues.map((c, k) => `${k + 1}\n${ts(c.s)} --> ${ts(c.e)}\n${c.t}\n`).join('\n'));
  console.log(out + '|' + (info[cls] || CLASS[cls.slice(0, 2)] || ''));
});
