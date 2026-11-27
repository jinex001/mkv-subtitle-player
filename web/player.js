/* MKV Subtitle Player — runs in the browser and inside the Mac app (window.mac is set by the app's preload). */
(function () {
'use strict';
const { t, langName, prefRank, iso1, apply: applyI18n } = window.I18N;
const ENC = window.SubEncoding;
const MAC = window.mac || null;
const $ = id => document.getElementById(id);
const v = $('v'), st = $('st');
let subs = [];          // {label, lang, cues:[{s,e,t}], track, live}
let active = -1, offset = 0, videoURL = null, scanGen = 0;

applyI18n();
document.querySelectorAll(MAC ? '[data-web]' : '[data-app]').forEach(el => { el.hidden = true; });
document.querySelectorAll(MAC ? '[data-app]' : '[data-web]').forEach(el => { el.hidden = false; });
if (MAC) $('hint').textContent = t('macHint');

function status(msg, err) { st.textContent = msg || ''; st.classList.toggle('err', !!err); }
function store(k, val) { try { localStorage.setItem(k, val); } catch (e) { /* private mode */ } }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

/* ---------- encoding menu ---------- */
const ENC_NAME = { 'utf-8': 'UTF-8', 'utf-16le': 'UTF-16 LE', 'utf-16be': 'UTF-16 BE', 'euc-kr': 'EUC-KR / CP949', 'shift_jis': 'Shift_JIS',
  'gb18030': 'GBK / GB18030', 'big5': 'Big5', 'koi8-r': 'KOI8-R' };
const encName = e => ENC_NAME[e] || e.replace(/^windows-/, 'Windows-');
(function buildEncMenu() {
  const sel = $('enc');
  const add = (val, label) => { const o = document.createElement('option'); o.value = val; o.textContent = label; sel.appendChild(o); };
  add('auto', t('encAuto'));
  for (const e of ENC.list) {
    const langs = (ENC.menuLangs[e] || []).map(l => langName(l)).filter(Boolean).join(', ');
    add(e, encName(e) + (langs ? ' — ' + langs : ''));
  }
})();

/* ---------- showing subtitles ---------- */
function cueText(s) {
  // keep <i> <b> <u>; drop other tags; escape a bare &
  s = s.replace(/&(?![a-z]+;|#\d+;)/gi, '&amp;');
  s = s.replace(/<\/?([a-z]+)[^>]*>/gi, (m, tag) => /^(i|b|u)$/i.test(tag) ? m.replace(/\s.*?>/, '>') : '');
  return s;
}
function newCue(c) {
  const s = Math.max(0, c.s + offset);
  const cue = new VTTCue(s, Math.max(s + 0.05, c.e + offset), cueText(c.t));
  cue.line = -2;
  return cue;
}
function makeTrack(sub) {
  const tr = v.addTextTrack('subtitles', sub.label, iso1(sub.lang) || '');
  tr.mode = 'disabled';
  sub.track = tr; sub.live = [];
  fill(sub);
}
function withCues(tr, fn) { const was = tr.mode; if (was === 'disabled') tr.mode = 'hidden'; fn(); tr.mode = was; }
function fill(sub) {
  const tr = sub.track; if (!tr) return;
  withCues(tr, () => {
    for (const c of sub.live) try { tr.removeCue(c); } catch (e) { /* already gone */ }
    sub.live = [];
    for (const c of sub.cues) { const cue = newCue(c); try { tr.addCue(cue); sub.live.push(cue); } catch (e) { /* bad cue */ } }
  });
}
function addCues(sub, list) { // while an MKV is still being read
  for (const c of list) {
    sub.cues.push(c);
    if (sub.track) withCues(sub.track, () => { const cue = newCue(c); try { sub.track.addCue(cue); sub.live.push(cue); } catch (e) { /* bad cue */ } });
  }
}
function select(i) {
  active = i;
  subs.forEach((s, k) => { if (s.track) s.track.mode = (k === i ? 'showing' : 'disabled'); });
  renderChips();
}
function renderChips() {
  const box = $('tracks'); box.innerHTML = '';
  const mk = (i, txt) => {
    const b = document.createElement('button'); b.className = 'chip'; b.textContent = txt; b.dataset.i = i;
    b.setAttribute('aria-pressed', String(i === active)); b.onclick = () => select(i); box.appendChild(b);
  };
  mk(-1, t('off'));
  subs.forEach((s, i) => mk(i, s.label + (s.cues.length ? '' : ' …')));
}
let chipT = 0;
function renderChipsSoft() { if (performance.now() - chipT > 1000) { chipT = performance.now(); renderChips(); } }
function addSub(sub) { subs.push(sub); makeTrack(sub); renderChips(); }
// best of a group of new subtitles: the user's own language first, then the file's default, then the first
function bestOf(list, isDefault) {
  let best = 0;
  list.forEach((s, i) => {
    const a = prefRank(s.lang), b = prefRank(list[best].lang);
    if (a < b || (a === b && isDefault && isDefault(s) && !isDefault(list[best]))) best = i;
  });
  return best;
}

/* ---------- subtitle files ---------- */
function ts(str) { // 00:01:02,345 / 01:02.345 / 0:01:02.34
  const p = str.trim().replace(',', '.').split(':').map(Number);
  let s = 0; for (const x of p) s = s * 60 + x; return s;
}
function parseSRTVTT(text) {
  const out = []; text = text.replace(/\r/g, '').replace(/^﻿/, '');
  const re = /((?:\d+:)?\d{1,2}:\d{2}[,.]\d{1,3})\s*-->\s*((?:\d+:)?\d{1,2}:\d{2}[,.]\d{1,3})[^\n]*\n([\s\S]*?)(?=\n\s*\n|$)/g;
  let m;
  while ((m = re.exec(text))) {
    const body = m[3].replace(/\n\d+\s*$/, '').trim();
    if (body) out.push({ s: ts(m[1]), e: ts(m[2]), t: body });
  }
  return out;
}
function assText(s) {
  return s.replace(/\{[^}]*\}/g, '').replace(/\\N/g, '\n').replace(/\\n/g, '\n').replace(/\\h/g, ' ').trim();
}
function parseASS(text) {
  const out = []; let fmt = null, inEv = false;
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (/^\[events\]/i.test(line)) { inEv = true; continue; }
    if (/^\[/.test(line)) { inEv = false; continue; }
    if (!inEv) continue;
    if (/^format:/i.test(line)) { fmt = line.slice(7).split(',').map(s => s.trim().toLowerCase()); continue; }
    if (/^dialogue:/i.test(line) && fmt) {
      const body = line.slice(line.indexOf(':') + 1), n = fmt.length;
      const parts = []; let rest = body;
      for (let i = 0; i < n - 1; i++) { const k = rest.indexOf(','); if (k < 0) break; parts.push(rest.slice(0, k)); rest = rest.slice(k + 1); }
      parts.push(rest);
      const body2 = assText(parts[fmt.indexOf('text')] || '');
      if (body2) out.push({ s: ts(parts[fmt.indexOf('start')]), e: ts(parts[fmt.indexOf('end')]), t: body2 });
    }
  }
  return out;
}
/* SMI (SAMI): <SYNC Start=ms><P Class=KRCC>text — one subtitle per Class (language) */
const entBox = document.createElement('textarea');
function decodeEnt(s) { entBox.innerHTML = s.replace(/</g, '\u0001'); return entBox.value.replace(/\u0001/g, '<'); }
const SMI_CLASS = { kr: 'ko', ko: 'ko', en: 'en', eg: 'en', us: 'en', jp: 'ja', ja: 'ja', cn: 'zh', zh: 'zh', tw: 'zh', es: 'es', sp: 'es',
  fr: 'fr', de: 'de', ge: 'de', ru: 'ru', it: 'it', pt: 'pt', br: 'pt', vi: 'vi', vn: 'vi', th: 'th', tr: 'tr', ar: 'ar' };
function parseSMI(text) {
  text = text.replace(/\r/g, '');
  // class names and languages from the style block: .KRCC { Name:Korean; lang:ko-KR; }
  const info = {};
  const sm = /\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g; let m;
  const style = (text.match(/<style[\s\S]*?<\/style>/i) || [''])[0];
  while ((m = sm.exec(style))) {
    const name = (m[2].match(/name\s*:\s*([^;]+)/i) || [])[1], lang = (m[2].match(/lang\s*:\s*([^;]+)/i) || [])[1];
    info[m[1].toLowerCase()] = { name: name && name.trim(), lang: lang && lang.trim().split('-')[0].toLowerCase() };
  }
  const byCls = {}, order = [];
  const syncRe = /<sync\b[^>]*\bstart\s*=\s*["']?(-?\d+)[^>]*>([\s\S]*?)(?=<sync\b|<\/body>|$)/gi;
  while ((m = syncRe.exec(text))) {
    const time = +m[1] / 1000, body = m[2];
    const parts = []; const pRe = /<p\b([^>]*)>([\s\S]*?)(?=<p\b|$)/gi; let pm, any = false;
    while ((pm = pRe.exec(body))) {
      any = true;
      const c = (pm[1].match(/class\s*=\s*["']?([A-Za-z0-9_-]+)/i) || [])[1] || 'default';
      parts.push([c.toLowerCase(), pm[2]]);
    }
    if (!any) parts.push(['default', body]);
    for (const [cls, raw] of parts) {
      let x = raw.replace(/<br\s*\/?>/gi, '\n')
        .replace(/<(\/?)(i|b|u)\b[^>]*>/gi, '\u0002$1$2\u0003')
        .replace(/<[^>]*>/g, '');
      x = decodeEnt(x).replace(/ /g, ' ').replace(/[ \t]+/g, ' ')
        .split('\n').map(l => l.trim()).filter(Boolean).join('\n')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\u0002/g, '<').replace(/\u0003/g, '>');
      if (!byCls[cls]) { byCls[cls] = []; order.push(cls); }
      const list = byCls[cls], prev = list[list.length - 1];
      if (prev && prev.e == null) prev.e = time; // the next SYNC ends the previous line
      if (x.replace(/<[^>]*>/g, '').trim()) list.push({ s: time, e: null, t: x });
    }
  }
  const out = [];
  for (const cls of order) {
    const cues = byCls[cls].filter(c => { if (c.e == null) c.e = c.s + 4; return c.e > c.s; });
    if (!cues.length) continue;
    const i = info[cls] || {};
    out.push({ cls, lang: i.lang || SMI_CLASS[cls.slice(0, 2)] || '', name: i.name, cues });
  }
  return out;
}
function decodeText(buf) {
  const pick = $('enc').value;
  if (pick !== 'auto') return { text: new TextDecoder(pick).decode(new Uint8Array(buf)), enc: pick, sure: true };
  const r = ENC.detect(new Uint8Array(buf), window.I18N.prefs);
  return { text: r.text, enc: r.encoding, sure: r.score >= 0.35 };
}
const lastSubFiles = [];
async function openSubFile(f, replaceIdxs) {
  const dec = decodeText(await f.arrayBuffer());
  const text = dec.text;
  const base = f.name.replace(/\.[^.]+$/, '');
  let groups;
  if (/\.(smi|sami)$/i.test(f.name) || /<sami\b|<sync\b/i.test(text.slice(0, 20000))) {
    groups = parseSMI(text).map((g, _, all) => ({
      label: all.length > 1 ? (langName(g.lang) || g.name || g.cls.toUpperCase()) + ' · ' + base : base, lang: g.lang, cues: g.cues }));
  } else {
    const cues = /\.(ass|ssa)$/i.test(f.name) || /^\s*\[script info\]/i.test(text) ? parseASS(text) : parseSRTVTT(text);
    // movie.ko.srt → Korean
    const tag = (base.match(/\.([a-z]{2,3}(?:-[A-Za-z]{2,4})?)$/i) || [])[1] || '';
    const known = tag && iso1(tag).length === 2 && langName(tag).toLowerCase() !== tag.toLowerCase();
    groups = cues.length ? [{ label: known ? langName(tag) + ' · ' + base.slice(0, -tag.length - 1) : base, lang: known ? tag : '', cues }] : [];
  }
  if (!groups.length) { status(t('noTimes', { file: f.name }), true); return; }
  for (const g of groups) { g.cues.sort((a, b) => a.s - b.s); g.label = g.label.slice(0, 32); }
  if (replaceIdxs) {
    groups.forEach((g, k) => { const old = subs[replaceIdxs[k]]; if (old) { old.cues = g.cues; fill(old); } });
    renderChips();
  } else {
    const idxs = [], first = subs.length;
    for (const g of groups) { idxs.push(subs.length); addSub(g); }
    lastSubFiles.push({ f, idxs });
    select(first + bestOf(groups));
  }
  const n = groups.reduce((a, g) => a + g.cues.length, 0);
  const extra = [groups.length > 1 ? t('langs', { k: groups.length }) : '', t('encUsed', { enc: encName(dec.enc) })].filter(Boolean).join(', ');
  status(t('loaded', { file: f.name, n }) + ' (' + extra + ')' + (dec.sure ? '' : ' — ' + t('encUnsure')), !dec.sure);
}
$('enc').onchange = async () => { // re-read added subtitle files with the chosen encoding
  for (const x of lastSubFiles) await openSubFile(x.f, x.idxs);
};

/* ---------- subtitles inside the MKV (EBML) ---------- */
const DESC = new Set([0x18538067, 0x1654AE6B, 0xAE, 0x6D80, 0x6240, 0x5034, 0x1549A966, 0x1F43B675, 0xA0]);
function vlen(b) { for (let i = 0; i < 8; i++) if (b & (0x80 >> i)) return i + 1; return 0; }
class Reader {
  constructor(f) { this.f = f; this.cs = 0; this.buf = new Uint8Array(0); this.CH = 8 << 20; }
  has(p, n) { return p >= this.cs && p + n <= this.cs + this.buf.length; }
  async ensure(p, n) {
    if (this.has(p, n) || p >= this.f.size) return;
    const end = Math.min(this.f.size, p + Math.max(n, this.CH));
    this.buf = new Uint8Array(await this.f.slice(p, end).arrayBuffer()); this.cs = p;
  }
  at(p) { return this.buf[p - this.cs]; }
  sub(p, n) { const o = p - this.cs; return this.buf.subarray(o, o + n); }
}
function uint(b) { let x = 0; for (const c of b) x = x * 256 + c; return x; }
async function inflate(bytes) {
  const ds = new DecompressionStream('deflate');
  const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
  return new Uint8Array(await out.arrayBuffer());
}
async function scanMKV(file, gen) {
  const R = new Reader(file), size = file.size, td = new TextDecoder('utf-8');
  const tracks = []; let cur = null, scale = 1e6, cts = 0, last = null;
  const subByNum = new Map(); let pending = []; let lastUI = 0;
  const prog = $('prog'), pi = $('progi'); prog.hidden = false;
  let pos = 0;
  const flush = async () => {
    for (const p of pending) {
      const tr = p.tr; let data = p.data;
      try {
        if (tr.comp) {
          if (tr.comp.algo === 3 && tr.comp.set) { const m = new Uint8Array(tr.comp.set.length + data.length); m.set(tr.comp.set); m.set(data, tr.comp.set.length); data = m; }
          else if (tr.comp.algo === 0) data = await inflate(data);
        }
      } catch (e) { continue; }
      let s = td.decode(data);
      if (/ASS|SSA/.test(tr.codec)) { const k = s.split(','); s = k.length >= 9 ? k.slice(8).join(',') : s; s = assText(s); }
      const start = p.t * scale / 1e9, end = p.dur != null ? (p.t + p.dur) * scale / 1e9 : start + 3;
      if (s.trim()) addCues(tr.sub, [{ s: start, e: end, t: s.trim() }]);
    }
    pending = [];
  };
  while (pos < size) {
    if (gen !== scanGen) return;
    if (!R.has(pos, 12)) await R.ensure(pos, 12);
    if (pos >= R.cs + R.buf.length) break;
    const b0 = R.at(pos), il = vlen(b0); if (!il || il > 4) break;
    let id = 0; for (let i = 0; i < il; i++) id = id * 256 + R.at(pos + i);
    const s0 = R.at(pos + il), sl = vlen(s0); if (!sl) break;
    let sz = s0 & (0xFF >> sl), allOnes = (sz === (0xFF >> sl));
    for (let i = 1; i < sl; i++) { const c = R.at(pos + il + i); sz = sz * 256 + c; if (c !== 0xFF) allOnes = false; }
    const ds = pos + il + sl;
    if (DESC.has(id)) {
      if (id === 0xAE) { cur = { num: 0, type: 0, codec: '', lang: 'eng', name: '', def: 1, forced: 0, comp: null }; tracks.push(cur); }
      else if (id === 0x5034 && cur) cur.comp = { algo: 0, set: null };
      else if (id === 0x1F43B675 && cur !== false) { // first cluster: track list is complete
        cur = false;
        for (const tk of tracks) {
          if (tk.type === 0x11 && /^S_TEXT\/(UTF8|ASS|SSA|WEBVTT|ASCII)/.test(tk.codec)) {
            tk.sub = { label: (tk.name || langName(tk.lang) || t('trackN', { n: tk.num })).slice(0, 32), lang: tk.lang, cues: [] };
            subByNum.set(tk.num, tk);
          }
        }
        report(tracks);
        const list = [...subByNum.values()];
        const first = subs.length;
        for (const tk of list) addSub(tk.sub);
        // forced tracks only cover foreign-language parts, so prefer full ones
        const full = list.filter(tk => !tk.forced);
        const pickFrom = full.length ? full : list;
        if (pickFrom.length && active < 0) {
          const b = pickFrom[bestOf(pickFrom.map(tk => tk.sub), s => pickFrom.find(tk => tk.sub === s).def)];
          select(first + list.indexOf(b));
        }
        if (!subByNum.size) { prog.hidden = true; return; }
      }
      pos = ds; continue;
    }
    if (allOnes) break; // another element of unknown size: stop
    const end = ds + sz;
    switch (id) {
      case 0x2AD7B1: await R.ensure(ds, sz); scale = uint(R.sub(ds, sz)); break;
      case 0xE7: await R.ensure(ds, sz); cts = uint(R.sub(ds, sz)); break;
      case 0xA3: case 0xA1: {
        await R.ensure(ds, Math.min(sz, 8));
        const tl = vlen(R.at(ds)); let tn = R.at(ds) & (0xFF >> tl); for (let i = 1; i < tl; i++) tn = tn * 256 + R.at(ds + i);
        const tr = subByNum.get(tn);
        if (tr) {
          await R.ensure(ds, sz);
          const h = R.sub(ds, sz); let rel = (h[tl] << 8) | h[tl + 1]; if (rel & 0x8000) rel -= 0x10000;
          last = { tr, data: h.slice(tl + 3), t: cts + rel, dur: null }; pending.push(last);
        } else last = null;
        break;
      }
      case 0x9B: if (last) { await R.ensure(ds, sz); last.dur = uint(R.sub(ds, sz)); } break;
      default:
        if (cur && [0xD7, 0x83, 0x86, 0x22B59C, 0x22B59D, 0x536E, 0x88, 0x55AA, 0x4254, 0x4255].includes(id)) {
          await R.ensure(ds, sz); const b = R.sub(ds, sz);
          const str = () => td.decode(b).replace(/\0+$/, '');
          if (id === 0xD7) cur.num = uint(b); else if (id === 0x83) cur.type = uint(b);
          else if (id === 0x86) cur.codec = str();
          else if (id === 0x22B59C) cur.lang = str();
          else if (id === 0x22B59D) cur.lang = str().split('-')[0];
          else if (id === 0x536E) cur.name = str();
          else if (id === 0x88) cur.def = uint(b); else if (id === 0x55AA) cur.forced = uint(b);
          else if (id === 0x4254 && cur.comp) cur.comp.algo = uint(b);
          else if (id === 0x4255 && cur.comp) cur.comp.set = b.slice();
        }
    }
    pos = end;
    if (pending.length > 40) await flush();
    const now = performance.now();
    if (now - lastUI > 150) {
      lastUI = now; pi.style.width = (pos / size * 100).toFixed(1) + '%';
      if (pending.length) await flush();
      renderChipsSoft();
    }
  }
  await flush();
  pi.style.width = '100%'; setTimeout(() => { prog.hidden = true; }, 400);
  renderChips();
  const list = [...subByNum.values()].map(tk => t('count', { label: tk.sub.label, n: tk.sub.cues.length })).join(' · ');
  if (list) status(t('done', { list }));
}
let codecNote = '';
function report(tracks) {
  const vid = tracks.filter(x => x.type === 1).map(x => x.codec), aud = tracks.filter(x => x.type === 2).map(x => x.codec);
  const img = tracks.filter(x => x.type === 0x11 && !/^S_TEXT/.test(x.codec)).length;
  const txt = tracks.filter(x => x.type === 0x11 && /^S_TEXT/.test(x.codec)).length;
  codecNote = t('codecs', { v: vid.join(', ') || t('none'), a: aud.join(', ') || t('none') });
  let m = txt ? t('found', { n: txt }) : t('noText');
  if (img) m += ' ' + t('imageSubs', { n: img });
  status(m + ' · ' + codecNote);
}

/* ---------- opening files ---------- */
// A file opened by path in the Mac app: same shape as a browser File (name, size, slice, arrayBuffer)
class PathFile {
  constructor(p) { const s = MAC.stat(p); this.path = p; this.name = s.name; this.size = s.size; this.type = ''; }
  slice(a, b) {
    const p = this.path, end = Math.min(b == null ? this.size : b, this.size), n = Math.max(0, end - a);
    return { arrayBuffer: async () => MAC.read(p, a, n).slice().buffer };
  }
  async arrayBuffer() { return MAC.read(this.path, 0, this.size).slice().buffer; }
}
function openPaths(paths) {
  const list = [];
  for (const p of paths) { try { list.push(new PathFile(p)); } catch (e) { status(t('cantOpen', { p }), true); } }
  return openFiles(list);
}
function clearSubs() {
  for (const s of subs) if (s.track) { s.track.mode = 'disabled'; for (const c of s.live) try { s.track.removeCue(c); } catch (e) { /* gone */ } }
  subs = []; active = -1; lastSubFiles.length = 0; renderChips();
}
async function openFiles(files) {
  const list = [...files]; if (!list.length) return;
  const vid = list.find(f => /\.(mkv|webm|mp4|m4v|mov)$/i.test(f.name) || /^video\//.test(f.type));
  const subFiles = list.filter(f => /\.(srt|smi|sami|vtt|ass|ssa)$/i.test(f.name));
  if (vid) {
    scanGen++; clearSubs();
    if (videoURL && videoURL.startsWith('blob:')) URL.revokeObjectURL(videoURL);
    const vpath = vid.path || (MAC ? MAC.pathFor(vid) : '');
    videoURL = vpath && MAC ? MAC.url(vpath) : URL.createObjectURL(vid);
    // Mac app: movie.srt, movie.ko.smi … next to the movie are added automatically
    if (vpath && MAC) {
      const have = new Set(subFiles.map(f => f.name.toLowerCase()));
      for (const sp of MAC.sidecars(vpath)) { const pf = new PathFile(sp); if (!have.has(pf.name.toLowerCase())) subFiles.push(pf); }
    }
    v.src = videoURL; $('drop').hidden = true;
    document.title = vid.name.replace(/\.[^.]+$/, '') + ' · ' + t('appName');
    status(t('opening', { file: vid.name }));
    v.play().catch(() => { /* autoplay may be blocked */ });
    if (/\.(mkv|webm)$/i.test(vid.name)) scanMKV(vid, scanGen).catch(e => status(t('scanStopped', { msg: e.message }), true));
  }
  for (const f of subFiles) await openSubFile(f);
}
$('fv').onchange = e => { openFiles(e.target.files); e.target.value = ''; };
$('fs').onchange = e => { openFiles(e.target.files); e.target.value = ''; };
v.addEventListener('error', () => {
  if (!v.src) return;
  status(t(MAC ? 'cantPlayApp' : 'cantPlay') + (codecNote ? ' (' + codecNote + ')' : ''), true);
});
const drop = $('drop');
['dragenter', 'dragover'].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); if (ev === 'drop' || e.target === drop) drop.classList.remove('over'); }));
document.addEventListener('drop', e => openFiles(e.dataTransfer.files));

/* ---------- controls ---------- */
// subtitle size = % of the video's height, so it scales in full screen too
let cuePct = 5.5;
function applyCue() {
  const h = v.getBoundingClientRect().height || v.clientHeight || 360;
  document.documentElement.style.setProperty('--cue', Math.max(12, Math.round(h * cuePct / 100)) + 'px');
}
function setSize(pct) {
  cuePct = Math.min(12, Math.max(3, Math.round(+pct * 2) / 2));
  $('size').value = cuePct; store('mkv-cue2', cuePct); applyCue();
  document.querySelectorAll('#sizes .chip').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.s === cuePct)));
}
$('size').oninput = e => setSize(e.target.value);
$('szm').onclick = () => setSize(cuePct - 0.5); $('szp').onclick = () => setSize(cuePct + 0.5);
document.querySelectorAll('#sizes .chip').forEach(b => { b.onclick = () => setSize(b.dataset.s); });
try { new ResizeObserver(applyCue).observe(v); } catch (e) { addEventListener('resize', applyCue); }
document.addEventListener('fullscreenchange', () => setTimeout(applyCue, 50));
setSize(+load('mkv-cue2') || 5.5);
function setOff(x) { offset = Math.round(x * 100) / 100; $('off').textContent = (offset > 0 ? '+' : '') + offset.toFixed(2) + 's'; subs.forEach(fill); }
$('sm').onclick = () => setOff(offset - 0.25); $('sp').onclick = () => setOff(offset + 0.25); $('s0').onclick = () => setOff(0);
$('bgc').onchange = e => document.documentElement.style.setProperty('--cuebg', e.target.checked ? 'rgba(0,0,0,.6)' : 'transparent');
document.addEventListener('keydown', e => {
  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) && e.target.type !== 'range') return;
  if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); if (v.paused) v.play(); else v.pause(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); v.currentTime += 5; }
  else if (e.key === 'z' || e.key === 'Z') setOff(offset - 0.25);
  else if (e.key === 'x' || e.key === 'X') setOff(offset + 0.25);
  else if (e.key === '-' || e.key === '_') setSize(cuePct - 0.5);
  else if (e.key === '=' || e.key === '+') setSize(cuePct + 0.5);
  else if (e.key === 'f' || e.key === 'F') { const r = v.requestFullscreen ? v.requestFullscreen() : (v.webkitEnterFullscreen && v.webkitEnterFullscreen()); if (r && r.catch) r.catch(() => {}); }
});
renderChips();

/* ---------- send to TV (browser only): Safari = AirPlay, Chrome = Remote Playback ---------- */
const cast = $('cast'), castl = $('castl');
if (!MAC && window.WebKitPlaybackTargetAvailabilityEvent) {
  castl.textContent = 'AirPlay';
  v.addEventListener('webkitplaybacktargetavailabilitychanged', e => { cast.hidden = e.availability !== 'available'; });
  v.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => status(t(v.webkitCurrentPlaybackTargetIsWireless ? 'airplayOn' : 'airplayOff')));
  cast.onclick = () => { try { v.webkitShowPlaybackTargetPicker(); } catch (e) { status(t('airplayFail'), true); } };
} else if (!MAC && v.remote && v.remote.watchAvailability) {
  v.remote.watchAvailability(a => { cast.hidden = !a; }).catch(() => { cast.hidden = true; });
  v.remote.onconnect = () => status(t('castOn'));
  v.remote.ondisconnect = () => status(t('castOff'));
  cast.onclick = () => {
    if (!v.src) { status(t('castNeedVideo'), true); return; }
    v.remote.prompt().catch(e => status(t('castFail', { msg: e.message || e.name }), true));
  };
}

/* ---------- Mac app hooks ---------- */
if (MAC) {
  MAC.on('open-paths', p => openPaths(p));
  MAC.on('menu-open', async () => { const p = await MAC.pick('video'); if (p.length) openPaths(p); });
  MAC.on('menu-sub', async () => { const p = await MAC.pick('sub'); if (p.length) openPaths(p); });
}
window.__mkv = { openFiles, subs: () => subs };
})();
