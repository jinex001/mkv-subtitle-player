// 맥 앱 묶기: npm run pack:arm64 (Apple Silicon) / npm run pack:x64 (인텔)
const { packager } = require('@electron/packager');
const path = require('path');
const arch = process.argv[2] || 'arm64';
packager({
  dir: __dirname,
  out: path.join(__dirname, 'dist'),
  overwrite: true,
  platform: 'darwin',
  arch,
  name: 'MKV 자막 플레이어',
  executableName: 'MKV Subtitle Player',
  appBundleId: 'app.mkvsubplayer',
  appCategoryType: 'public.app-category.video',
  icon: path.join(__dirname, 'icon.icns'),
  ignore: [/^\/dist/, /^\/node_modules/, /icon\.png$/, /pack\.cjs$/],
  extendInfo: {
    CFBundleDocumentTypes: [{
      CFBundleTypeName: 'Video', CFBundleTypeRole: 'Viewer', LSHandlerRank: 'Alternate',
      CFBundleTypeExtensions: ['mkv', 'webm', 'mp4', 'm4v', 'mov'],
    }],
  },
}).then(out => console.log('만들어짐:', out.join(', ')));
