// MKV 자막 플레이어 — Electron 메인 프로세스
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');

let win = null;
let pending = []; // 창이 뜨기 전에 Finder에서 넘어온 파일

function send(paths) {
  if (win && !win.webContents.isLoading()) win.webContents.send('open-paths', paths);
  else pending.push(...paths);
}

// Finder "다음으로 열기", Dock 아이콘에 끌어다 놓기
app.on('open-file', (e, p) => { e.preventDefault(); send([p]); if (!win && app.isReady()) createWindow(); });

function createWindow() {
  win = new BrowserWindow({
    width: 1120, height: 860, minWidth: 560, minHeight: 480,
    backgroundColor: '#0E0F12', title: 'MKV 자막 플레이어',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false },
  });
  win.loadFile('index.html');
  win.webContents.on('did-finish-load', () => {
    const args = process.argv.slice(app.isPackaged ? 1 : 2).filter(a => !a.startsWith('-'));
    const all = [...pending, ...args]; pending = [];
    if (all.length) win.webContents.send('open-paths', all);
  });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', e => e.preventDefault()); // 파일을 창에 떨어뜨려도 페이지가 바뀌지 않게
  win.on('page-title-updated', (e, t) => { e.preventDefault(); win.setTitle(t); });
  win.on('closed', () => { win = null; });
}

ipcMain.handle('pick', async (e, kind) => {
  const filters = kind === 'sub'
    ? [{ name: '자막', extensions: ['srt', 'smi', 'sami', 'vtt', 'ass', 'ssa'] }]
    : [{ name: '영상', extensions: ['mkv', 'webm', 'mp4', 'm4v', 'mov'] }, { name: '모든 파일', extensions: ['*'] }];
  const r = await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'], filters });
  return r.canceled ? [] : r.filePaths;
});

function menu() {
  const toWin = ch => () => win && win.webContents.send(ch);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { label: '파일', submenu: [
      { label: '영상 열기…', accelerator: 'CmdOrCtrl+O', click: toWin('menu-open') },
      { label: '자막 파일 추가…', accelerator: 'Shift+CmdOrCtrl+O', click: toWin('menu-sub') },
      { type: 'separator' }, { role: 'close', label: '창 닫기' },
    ] },
    { role: 'editMenu' },
    { label: '보기', submenu: [{ role: 'togglefullscreen', label: '전체 화면' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
    { role: 'windowMenu' },
  ]));
}

app.whenReady().then(() => { menu(); createWindow(); });
app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (!win) createWindow(); });
