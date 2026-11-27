/*
 * Subtitle encoding detection.
 *
 * Old .srt / .smi files are rarely UTF-8: each region used its own code page.
 * We decode the bytes with every likely candidate and score how much the result
 * looks like real text in that candidate's languages. The OS / browser languages
 * break near-ties (a Russian user's ambiguous file is more likely Windows-1251).
 *
 * Works in the browser (window.SubEncoding) and in Node (module.exports) for tests.
 */
(function (root) {
  'use strict';

  // Weighted letters: 1 = very common in these languages, lower = rarer.
  function weights(groups) {
    const m = new Map();
    for (const [w, chars] of groups) for (const c of chars) if (!m.has(c)) m.set(c, w);
    return m;
  }

  // Single-byte code pages. kind "latin": accented letters sit inside Latin words.
  // kind "script": whole words are made of high bytes (Cyrillic, Greek, Hebrew, Arabic).
  const SINGLE = [
    { enc: 'windows-1252', langs: ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'sv', 'da', 'no', 'nb', 'fi', 'ca'], kind: 'latin',
      w: weights([[1, 'éáíóúñüöäàèçãõâêôßÉÁÍÓÚÑÜÖÄÀÈÇ'], [.6, 'åøæîïûëœÅØÆÎÏÛËŒòùìÒÙÌ'], [.15, 'ÿŸýÝšžŠŽð']]) },
    { enc: 'windows-1250', langs: ['pl', 'cs', 'sk', 'hu', 'ro', 'hr', 'sl', 'bs', 'sq'], kind: 'latin',
      w: weights([[1, 'ąćęłńśźżĄĆĘŁŃŚŹŻčďěňřšťůžČĎĚŇŘŠŤŮŽőűŐŰăşţâîĂŞŢÂÎ'], [.8, 'áéíóúýöüÁÉÍÓÚÝÖÜ'], [.3, 'äôĺľŕÄÔĹĽŔ']]) },
    { enc: 'windows-1254', langs: ['tr', 'az'], kind: 'latin',
      w: weights([[1, 'çğıöşüÇĞİÖŞÜ'], [.5, 'âîûÂÎÛ'], [.2, 'éáíóúàèñ']]) },
    { enc: 'windows-1257', langs: ['lt', 'lv', 'et'], kind: 'latin',
      w: weights([[1, 'ąčęėįšųūžĄČĘĖĮŠŲŪŽāēģīķļņŗĀĒĢĪĶĻŅŖõäöüÕÄÖÜ']]) },
    { enc: 'windows-1258', langs: ['vi'], kind: 'latin',
      w: weights([[1, 'ăâêôơưđĂÂÊÔƠƯĐ̣̀́̃̉'], [.6, 'àáãèéìíòóõùúýÀÁÃÈÉÌÍÒÓÕÙÚÝ']]) },
    { enc: 'windows-1251', cased: true, langs: ['ru', 'uk', 'bg', 'sr', 'mk', 'be'], kind: 'script',
      w: weights([[1, 'оеаинтсрвлкмдпу'], [.7, 'яыьгзбчйхжшюцщэфъёієї'], [.4, 'ОЕАИНТСРВЛКМДПУЯЫГЗБЧЙХЖШЮЦЩЭФЁІЄЇ']]) },
    { enc: 'koi8-r', cased: true, langs: ['ru'], kind: 'script',
      w: weights([[1, 'оеаинтсрвлкмдпу'], [.7, 'яыьгзбчйхжшюцщэфъё'], [.4, 'ОЕАИНТСРВЛКМДПУЯЫГЗБЧЙХЖШЮЦЩЭФЁ']]) },
    { enc: 'windows-1253', cased: true, langs: ['el'], kind: 'script',
      w: weights([[1, 'αεοιτνσςρηκπμυλάέήίόύώ'], [.7, 'δγωχθφβξζψϊϋΐΰ'], [.4, 'ΑΕΟΙΤΝΣΡΗΚΠΜΥΛΔΓΩΧΘΦΒΞΖΨΆΈΉΊΌΎΏ']]) },
    { enc: 'windows-1255', langs: ['he', 'yi'], kind: 'script',
      w: weights([[1, 'יוהלמארבתשנ'], [.7, 'כדעקפחסצגזטףךםןץ']]) },
    { enc: 'windows-1256', langs: ['ar', 'fa', 'ur'], kind: 'script',
      w: weights([[1, 'الينمورتبكهدف'], [.7, 'عقسحجشصخطذغضزثظءآأإةىیگچپژ']]) },
  ];

  // The most frequent Chinese characters (simplified / traditional). Coverage of these
  // is what separates real Chinese from bytes of another encoding decoded as Chinese.
  const ZH_COMMON_S = '的一是不了人我在有他这中大来上国个到说们为子和你地出道也时年得就那要下以生会自着去之过家学对可她里后小么心多天而能好都然没日于起还发成事只作当想看文无开手十用主行方又如前所本见经头面公同三已老从动两长知民样现分将外但身些与高意进把法此实回二理美点月明其种声全工己话儿者向情部正名定女问力机给等几很业最间新什打便位因重被走电四第门相次东政海口使教西再平真听世气信北少关并内加化由却代军产入先山五太水万市眼体别处总才场师书比住员九笑性通目华报立马命张活难神数件安表原车白应路期叫死常提感金何更反合放做系计或司利受光王果亲界及今京务制解各任至清物台象记边共风战干接它许八特觉望直服毛林题建南度统色字请交爱让认算论百吃义科怎元社术结六功指思非流每青管夫连远资队跟带花快条院变联言权往展该领传近留红治决周保达办运武半候七必城父强步完革深区即求品士转量空甚众技轻程告江语英基派满式李息写呢识极令黄德收脸钱党倒未持取设始版双历越史商千片容研像找友孩站广改议形委早房音火际则首单据导影失拿网香似斯专石若兵弟谁校读志飞观争究包组造落视济喜离虽坐集编宝谈府拉黑且随格尽剑讲布杀微怕母调局根曾准团段终乐切级克精哪官示冷域读';
  const ZH_COMMON_T = '的一是不了人我在有他這中大來上國個到說們為子和你地出道也時年得就那要下以生會自著去之過家學對可她裡後小麼心多天而能好都然沒日於起還發成事只作當想看文無開手十用主行方又如前所本見經頭面公同三已老從動兩長知民樣現分將外但身些與高意進把法此實回二理美點月明其種聲全工己話兒者向情部正名定女問力機給等幾很業最間新什打便位因重被走電四第門相次東政海口使教西再平真聽世氣信北少關並內加化由卻代軍產入先山五太水萬市眼體別處總才場師書比住員九笑性通目華報立馬命張活難神數件安表原車白應路期叫死常提感金何更反合放做系計或司利受光王果親界及今京務制解各任至清物台象記邊共風戰乾接它許八特覺望直服毛林題建南度統色字請交愛讓認算論百吃義科怎元社術結六功指思非流每青管夫連遠資隊跟帶花快條院變聯言權往展該領傳近留紅治決周保達辦運武半候七必城父強步完革深區即求品士轉量空甚眾技輕程告江語英基派滿式李息寫呢識極令黃德收臉錢黨倒未持取設始版雙歷越史商千片容研像找友孩站廣改議形委早房音火際則首單據導影失拿網香似斯專石若兵弟誰校讀志飛觀爭究包組造落視濟喜離雖坐集編寶談府拉黑且隨格盡劍講布殺微怕母調局根曾準團段終樂切級克精哪官示冷域';
  const ZH_S = new Set(ZH_COMMON_S), ZH_T = new Set(ZH_COMMON_T);
  const CJK_PUNCT = new Set('，。！？、：；“”‘’（）《》「」『』…—～·');

  const isCJK = c => c >= 0x4E00 && c <= 0x9FFF;
  const isHangul = c => c >= 0xAC00 && c <= 0xD7A3;
  const isKana = c => (c >= 0x3041 && c <= 0x309F) || (c >= 0x30A0 && c <= 0x30FF);

  const MULTI = [
    { enc: 'euc-kr', langs: ['ko'], score(ch, c) { return isHangul(c) ? 1 : isCJK(c) ? .1 : CJK_PUNCT.has(ch) ? .3 : 0; } },
    { enc: 'shift_jis', langs: ['ja'], score(ch, c) { return isKana(c) ? 1 : isCJK(c) ? (ZH_S.has(ch) || ZH_T.has(ch) ? .9 : .45) : CJK_PUNCT.has(ch) ? .8 : 0; } },
    { enc: 'gb18030', langs: ['zh-hans', 'zh-cn', 'zh-sg', 'zh'], score(ch, c) { return ZH_S.has(ch) ? 1 : CJK_PUNCT.has(ch) ? 1 : isCJK(c) ? .15 : 0; } },
    { enc: 'big5', langs: ['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'], score(ch, c) { return ZH_T.has(ch) ? 1 : CJK_PUNCT.has(ch) ? 1 : isCJK(c) ? .15 : 0; } },
  ];

  const LIST = ['utf-8', 'utf-16le', 'utf-16be', ...MULTI.map(m => m.enc), ...SINGLE.map(s => s.enc)];
  // Language lists shown next to each encoding in the menu
  const MENU_LANGS = {
    'euc-kr': ['ko'], 'shift_jis': ['ja'], 'gb18030': ['zh-Hans'], 'big5': ['zh-Hant'],
    'windows-1252': ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl'], 'windows-1250': ['pl', 'cs', 'hu', 'ro', 'hr'],
    'windows-1254': ['tr'], 'windows-1257': ['lt', 'lv', 'et'], 'windows-1258': ['vi'],
    'windows-1251': ['ru', 'uk', 'bg', 'sr'], 'koi8-r': ['ru'], 'windows-1253': ['el'],
    'windows-1255': ['he'], 'windows-1256': ['ar', 'fa'],
  };

  const isAsciiLetter = b => (b >= 0x41 && b <= 0x5A) || (b >= 0x61 && b <= 0x7A);
  const isLetter = ch => /\p{L}/u.test(ch);

  function decoder(enc, fatal) {
    try { return new TextDecoder(enc, { fatal: !!fatal }); } catch (e) { return null; }
  }

  function scoreSingle(cand, u8, text) {
    // decoded text has exactly one char per byte for these code pages
    if (text.length !== u8.length) return 0;
    let high = 0, adj = 0, sum = 0, starts = 0, upper = 0;
    for (let i = 0; i < u8.length; i++) {
      const b = u8[i];
      if (b < 0x80) continue;
      high++;
      if ((i > 0 && isAsciiLetter(u8[i - 1])) || (i + 1 < u8.length && isAsciiLetter(u8[i + 1]))) adj++;
      const ch = text[i];
      if (ch === '\uFFFD') { sum -= 2; continue; }
      if (cand.cased && isLineStart(u8, i)) { starts++; if (ch !== ch.toLowerCase()) upper++; }
      let w = cand.w.get(ch) || 0;
      // ¿ ¡ only count as Spanish punctuation at the start of a word
      if (!w && (ch === '¿' || ch === '¡') && !(i > 0 && (isAsciiLetter(u8[i - 1]) || u8[i - 1] >= 0x80))) w = .8;
      sum += w;
    }
    if (!high) return 0;
    const latinish = adj / high;
    let base = Math.max(0, sum / high);
    // Cyrillic and Greek lines start with a capital; Hebrew and Arabic have no case,
    // so their bytes read as Cyrillic look like lines that start in lowercase.
    if (cand.cased && starts >= 3) base *= 0.3 + 0.7 * (upper / starts);
    return cand.kind === 'latin' ? base * (0.25 + 0.75 * latinish) : base * (1 - latinish);
  }

  // first letter of a line or sentence (skipping spaces, dashes, quotes and <i> tags)
  function isLineStart(u8, i) {
    let j = i - 1;
    while (j >= 0) {
      const b = u8[j];
      if (b === 0x20 || b === 0x2D || b === 0x22 || b === 0x27 || b === 0x09) { j--; continue; }
      if (b === 0x3E) { const k = u8.lastIndexOf(0x3C, j); if (k >= 0 && j - k < 6) { j = k - 1; continue; } }
      break;
    }
    if (j < 0) return true;
    const b = u8[j];
    return b === 0x0A || b === 0x0D || ((b === 0x2E || b === 0x21 || b === 0x3F) && u8[j + 1] === 0x20);
  }

  function scoreMulti(cand, text) {
    let n = 0, sum = 0;
    for (const ch of text) {
      const c = ch.codePointAt(0);
      if (c < 0x80) continue;
      n++; sum += cand.score(ch, c);
    }
    return n ? sum / n : 0;
  }

  function normPrefs(prefs) {
    const out = [];
    for (const p of prefs || []) {
      const l = String(p).toLowerCase();
      out.push(l);
      if (l.startsWith('zh')) out.push(/hant|tw|hk|mo/.test(l) ? 'zh-hant' : 'zh-hans');
      out.push(l.split('-')[0]);
    }
    return out;
  }

  /**
   * detect(bytes, preferredLanguages) -> { encoding, text, score, ranked }
   * score is 0..1-ish; below ~0.35 the guess is shaky and the UI should say so.
   */
  function detect(input, prefs) {
    const u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
    const pref = normPrefs(prefs);
    // BOMs
    if (u8[0] === 0xEF && u8[1] === 0xBB && u8[2] === 0xBF) return done('utf-8', 1);
    if (u8[0] === 0xFF && u8[1] === 0xFE) return done('utf-16le', 1);
    if (u8[0] === 0xFE && u8[1] === 0xFF) return done('utf-16be', 1);
    // UTF-16 without BOM: lots of zero bytes on one side
    const probe = Math.min(u8.length, 4000);
    let z0 = 0, z1 = 0;
    for (let i = 0; i + 1 < probe; i += 2) { if (u8[i] === 0) z0++; if (u8[i + 1] === 0) z1++; }
    if (probe > 20 && z1 > probe * 0.2 && z1 > z0 * 4) return done('utf-16le', .9);
    if (probe > 20 && z0 > probe * 0.2 && z0 > z1 * 4) return done('utf-16be', .9);
    // Valid UTF-8 (pure ASCII lands here too)
    try { const t = new TextDecoder('utf-8', { fatal: true }).decode(u8); return { encoding: 'utf-8', text: t, score: 1, ranked: [] }; } catch (e) { /* not UTF-8 */ }

    // Sample the start of big files for speed; decode the winner fully at the end.
    const sample = u8.length > 200000 ? u8.subarray(0, 200000) : u8;
    const ranked = [];
    for (const cand of MULTI) {
      const d = decoder(cand.enc, true); if (!d) continue;
      let text;
      // a cut in the middle of a character at the sample's end is not an error
      try { text = d.decode(sample === u8 ? u8 : trimTail(sample)); } catch (e) { continue; }
      ranked.push({ enc: cand.enc, langs: cand.langs, score: scoreMulti(cand, text) });
    }
    for (const cand of SINGLE) {
      const d = decoder(cand.enc); if (!d) continue;
      ranked.push({ enc: cand.enc, langs: cand.langs, score: scoreSingle(cand, sample, d.decode(sample)) });
    }
    for (const r of ranked) {
      const i = pref.findIndex(p => r.langs.includes(p));
      if (i >= 0) r.score *= 1.08 - Math.min(i, 5) * 0.01; // the user's own languages win near-ties
    }
    ranked.sort((a, b) => b.score - a.score);
    const best = ranked[0] || { enc: 'windows-1252', score: 0 };
    return done(best.enc, best.score, ranked);

    function done(enc, score, r) {
      const d = decoder(enc) || new TextDecoder('utf-8');
      return { encoding: enc, text: d.decode(u8), score, ranked: r || [] };
    }
  }

  // drop a possibly-cut multi-byte character at the end of a sample
  function trimTail(u8) {
    let end = u8.length;
    while (end > 0 && u8.length - end < 3 && u8[end - 1] >= 0x80) end--;
    return u8.subarray(0, end);
  }

  const api = { detect, list: LIST, menuLangs: MENU_LANGS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SubEncoding = api;
})(typeof window !== 'undefined' ? window : this);
