// 페이지가 쓸 수 있는 맥 기능만 골라서 열어 줌 (파일 읽기, 같은 이름 자막 찾기, 열기 창)
const { contextBridge, ipcRenderer, webUtils } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

contextBridge.exposeInMainWorld('mac', {
  pathFor: f => { try { return webUtils.getPathForFile(f) || ''; } catch (e) { return ''; } },
  stat: p => { const s = fs.statSync(p); return { size: s.size, name: path.basename(p) }; },
  read: (p, pos, len) => {
    const fd = fs.openSync(p, 'r');
    try { const b = Buffer.alloc(len); const n = fs.readSync(fd, b, 0, len, pos); return new Uint8Array(b.buffer, b.byteOffset, n); }
    finally { fs.closeSync(fd); }
  },
  url: p => pathToFileURL(p).href,
  // 영화.mkv 옆의 영화.srt, 영화.ko.smi … (영화2.srt는 아님)
  sidecars: p => {
    const dir = path.dirname(p), base = path.basename(p).replace(/\.[^.]+$/, '').toLowerCase();
    try {
      return fs.readdirSync(dir)
        .filter(n => /\.(srt|smi|sami|vtt|ass|ssa)$/i.test(n) && n.toLowerCase().startsWith(base + '.'))
        .sort().map(n => path.join(dir, n));
    } catch (e) { return []; }
  },
  pick: kind => ipcRenderer.invoke('pick', kind),
  // re-encode the audio to AAC with the user's ffmpeg; onProgress gets 0–99
  fixAudio: (p, onProgress) => {
    const h = (e, pct) => { try { onProgress(pct); } catch (err) { /* page reloaded */ } };
    ipcRenderer.on('fix-progress', h);
    return ipcRenderer.invoke('fix-audio', p).finally(() => ipcRenderer.removeListener('fix-progress', h));
  },
  fixCancel: () => ipcRenderer.send('fix-cancel'),
  on: (ch, fn) => ipcRenderer.on(ch, (e, a) => fn(a)),
});
