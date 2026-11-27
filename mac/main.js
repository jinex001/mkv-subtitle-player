// MKV Subtitle Player — Electron main process
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');

// Menu and dialog text follows the macOS language (the page itself uses navigator.languages)
const M = {
  en: { file: 'File', view: 'View', open: 'Open Video…', sub: 'Add Subtitle File…', close: 'Close Window', full: 'Toggle Full Screen', video: 'Video', subs: 'Subtitles', all: 'All Files' },
  ko: { file: '파일', view: '보기', open: '영상 열기…', sub: '자막 파일 추가…', close: '창 닫기', full: '전체 화면', video: '영상', subs: '자막', all: '모든 파일' },
  ja: { file: 'ファイル', view: '表示', open: '動画を開く…', sub: '字幕ファイルを追加…', close: 'ウインドウを閉じる', full: 'フルスクリーン', video: '動画', subs: '字幕', all: 'すべてのファイル' },
  'zh-Hans': { file: '文件', view: '显示', open: '打开视频…', sub: '添加字幕文件…', close: '关闭窗口', full: '全屏', video: '视频', subs: '字幕', all: '所有文件' },
  'zh-Hant': { file: '檔案', view: '顯示方式', open: '開啟影片…', sub: '加入字幕檔…', close: '關閉視窗', full: '全螢幕', video: '影片', subs: '字幕', all: '所有檔案' },
  es: { file: 'Archivo', view: 'Ver', open: 'Abrir vídeo…', sub: 'Añadir subtítulos…', close: 'Cerrar ventana', full: 'Pantalla completa', video: 'Vídeo', subs: 'Subtítulos', all: 'Todos los archivos' },
  pt: { file: 'Arquivo', view: 'Visualizar', open: 'Abrir vídeo…', sub: 'Adicionar legenda…', close: 'Fechar janela', full: 'Tela cheia', video: 'Vídeo', subs: 'Legendas', all: 'Todos os arquivos' },
  de: { file: 'Ablage', view: 'Darstellung', open: 'Video öffnen …', sub: 'Untertiteldatei hinzufügen …', close: 'Fenster schließen', full: 'Vollbild', video: 'Video', subs: 'Untertitel', all: 'Alle Dateien' },
  fr: { file: 'Fichier', view: 'Présentation', open: 'Ouvrir une vidéo…', sub: 'Ajouter des sous-titres…', close: 'Fermer la fenêtre', full: 'Plein écran', video: 'Vidéo', subs: 'Sous-titres', all: 'Tous les fichiers' },
};
function texts() {
  const langs = (app.getPreferredSystemLanguages ? app.getPreferredSystemLanguages() : []).concat(app.getLocale());
  for (const raw of langs) {
    const l = String(raw || '').toLowerCase();
    if (l.startsWith('zh')) return M[/hant|-tw|-hk|-mo/.test(l) ? 'zh-Hant' : 'zh-Hans'];
    if (M[l.split('-')[0]]) return M[l.split('-')[0]];
  }
  return M.en;
}

let win = null;
let pending = []; // files from Finder before the window is ready

function send(paths) {
  if (win && !win.webContents.isLoading()) win.webContents.send('open-paths', paths);
  else pending.push(...paths);
}

// Finder "Open With", dropping on the Dock icon
app.on('open-file', (e, p) => { e.preventDefault(); send([p]); if (!win && app.isReady()) createWindow(); });

function createWindow() {
  win = new BrowserWindow({
    width: 1120, height: 860, minWidth: 560, minHeight: 480,
    backgroundColor: '#0E0F12',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false },
  });
  win.loadFile(path.join(__dirname, 'web', 'index.html'));
  win.webContents.on('did-finish-load', () => {
    const args = process.argv.slice(app.isPackaged ? 1 : 2).filter(a => !a.startsWith('-') && a !== '.');
    const all = [...pending, ...args]; pending = [];
    if (all.length) win.webContents.send('open-paths', all);
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { // dropping a file on the window must not replace the page
    e.preventDefault();
    if (/^https:\/\//.test(url)) shell.openExternal(url);
  });
  win.on('closed', () => { win = null; });
}

ipcMain.handle('pick', async (e, kind) => {
  const T = texts();
  const filters = kind === 'sub'
    ? [{ name: T.subs, extensions: ['srt', 'smi', 'sami', 'vtt', 'ass', 'ssa'] }]
    : [{ name: T.video, extensions: ['mkv', 'webm', 'mp4', 'm4v', 'mov'] }, { name: T.all, extensions: ['*'] }];
  const r = await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'], filters });
  return r.canceled ? [] : r.filePaths;
});

function menu() {
  const T = texts();
  const toWin = ch => () => win && win.webContents.send(ch);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { label: T.file, submenu: [
      { label: T.open, accelerator: 'CmdOrCtrl+O', click: toWin('menu-open') },
      { label: T.sub, accelerator: 'Shift+CmdOrCtrl+O', click: toWin('menu-sub') },
      { type: 'separator' }, { role: 'close', label: T.close },
    ] },
    { role: 'editMenu' },
    { label: T.view, submenu: [{ role: 'togglefullscreen', label: T.full }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
    { role: 'windowMenu' },
  ]));
}

app.whenReady().then(() => { menu(); createWindow(); });
app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (!win) createWindow(); });
