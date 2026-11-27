/*
 * UI text. The language follows the OS / browser (navigator.languages); there is no picker.
 * Add a language: copy the `en` block, translate, and add a match in pickLang().
 * {name} placeholders are filled by t(key, {name: value}).
 */
(function (root) {
  'use strict';
  const S = {
    en: {
      appName: 'MKV Subtitle Player', appNameHtml: 'MKV <b>Subtitle</b> Player',
      privacy: 'Files open on this device only. Nothing is uploaded.',
      macHint: '⌘O open video · ⇧⌘O add subtitles · subtitle files next to the movie are added automatically',
      dropTitle: 'Drop an MKV file here, or click to choose one',
      dropText: 'Text subtitles inside the file (SRT, ASS) are read automatically. You can also drop .srt / .smi / .vtt / .ass files.',
      openVideo: 'Open video', addSubs: 'Add subtitle file',
      encAuto: 'Encoding: auto', encAria: 'Subtitle file text encoding', encTitle: 'If letters look garbled, pick the encoding here',
      subsLabel: 'Subtitles', subsAria: 'Choose subtitles', off: 'Off', trackN: 'Subtitles {n}',
      size: 'Size', sizeAria: 'Subtitle size', sizeS: 'Small', sizeM: 'Normal', sizeL: 'Large', sizeXL: 'Extra large',
      sizeDown: 'Smaller (−)', sizeUp: 'Larger (+)', sizeRange: 'Subtitle size (% of video height)',
      sync: 'Sync', syncAria: 'Subtitle timing', syncEarlier: 'Show subtitles 0.25 s earlier (Z)', syncLater: 'Show subtitles 0.25 s later (X)', reset: 'Reset',
      subBg: 'Background',
      cast: 'Send to TV', airplayOn: 'Playing on TV via AirPlay. If subtitles don’t show on the TV, use Screen Mirroring.', airplayOff: 'AirPlay disconnected.',
      airplayFail: 'Couldn’t open AirPlay.', castOn: 'Playing on TV. If subtitles don’t show on the TV, use screen mirroring.', castOff: 'TV disconnected.',
      castNeedVideo: 'Open a video first.', castFail: 'Couldn’t send to TV: {msg}',
      noteBrowser: 'MKV plays in Chrome, Edge and Firefox. Safari on iPhone and Mac can’t open MKV files.',
      noteMac: 'In Finder, right-click an MKV → Open With, or drop it on the Dock icon.',
      noteTV: 'To watch on Apple TV, turn on Screen Mirroring in Control Center and go full screen (F). Subtitles come along.',
      noteCodec: 'AC-3 and DTS audio may be silent, and H.265 (HEVC) video depends on your device.',
      noteImage: 'Image-based subtitles (PGS, VobSub) can’t be read. Add an .srt or .smi file instead.',
      keys: 'Shortcuts', kPlay: 'play/pause', kSeek: '5 s', kSync: 'sync', kSize: 'subtitle size', kFull: 'full screen',
      noTimes: '{file}: no subtitle timings found.',
      loaded: '{file}: {n} subtitles loaded', langs: '{k} languages', encUsed: 'encoding {enc}',
      encUnsure: 'if letters look garbled, choose the encoding by hand',
      done: 'Subtitles ready: {list}', count: '{label} ({n})',
      found: 'Found {n} text subtitle tracks. Reading…', noText: 'No text subtitles in this file. Try adding a subtitle file.',
      imageSubs: '({n} image-based subtitle tracks can’t be read)', codecs: 'video {v} · audio {a}', none: 'none',
      opening: 'Opening {file}…', scanStopped: 'Stopped reading subtitles: {msg}',
      cantPlay: 'This browser can’t play this video. Try Chrome or Edge.', cantPlayApp: 'This video’s format can’t be played.',
      cantOpen: 'Can’t open file: {p}',
    },
    ko: {
      appName: 'MKV 자막 플레이어', appNameHtml: 'MKV <b>자막</b> 플레이어',
      privacy: '파일은 이 기기 안에서만 열려요. 어디에도 올라가지 않아요.',
      macHint: '⌘O 영상 열기 · ⇧⌘O 자막 추가 · 영화 옆 같은 이름의 자막은 자동으로 붙어요',
      dropTitle: 'MKV 파일을 여기에 놓거나 눌러서 고르세요',
      dropText: '안에 든 글자 자막(SRT·ASS)은 자동으로 읽어요. 따로 있는 .srt / .smi / .vtt / .ass 파일도 함께 놓을 수 있어요.',
      openVideo: '영상 열기', addSubs: '자막 파일 추가',
      encAuto: '인코딩 자동', encAria: '자막 파일 글자 인코딩', encTitle: '자막 글자가 깨지면 여기서 바꿔 보세요',
      subsLabel: '자막', subsAria: '자막 선택', off: '끔', trackN: '자막 {n}',
      size: '자막 크기', sizeAria: '자막 크기 고르기', sizeS: '작게', sizeM: '보통', sizeL: '크게', sizeXL: '아주 크게',
      sizeDown: '자막 작게 (−)', sizeUp: '자막 크게 (+)', sizeRange: '자막 크기 (영상 높이 대비 %)',
      sync: '싱크', syncAria: '자막 싱크', syncEarlier: '자막을 0.25초 빠르게 (Z)', syncLater: '자막을 0.25초 늦게 (X)', reset: '초기화',
      subBg: '자막 배경',
      cast: 'TV로 보내기', airplayOn: 'AirPlay로 TV에서 재생 중이에요. 자막이 TV에 안 나오면 화면 미러링을 쓰세요.', airplayOff: 'AirPlay 연결을 끊었어요.',
      airplayFail: 'AirPlay를 열지 못했어요.', castOn: 'TV에서 재생 중이에요. 자막이 TV에 안 나오면 화면 미러링을 쓰세요.', castOff: 'TV 연결을 끊었어요.',
      castNeedVideo: '먼저 영상을 여세요.', castFail: 'TV로 보내지 못했어요: {msg}',
      noteBrowser: 'MKV 재생은 Chrome·Edge·Firefox에서 돼요. 아이폰·맥 Safari는 MKV 자체를 못 열어요.',
      noteMac: 'Finder에서 MKV를 오른쪽 클릭 → 다음으로 열기, 또는 Dock 아이콘에 끌어다 놓아도 열려요.',
      noteTV: 'Apple TV로 볼 땐 제어 센터의 화면 미러링을 켜고 전체 화면(F)으로 보세요. 자막도 그대로 보여요.',
      noteCodec: '음성이 AC-3·DTS면 소리가 안 날 수 있고, H.265(HEVC) 영상은 기기에 따라 안 나와요.',
      noteImage: '그림 자막(PGS, VobSub)은 못 읽어요. 그럴 땐 .srt나 .smi 파일을 따로 추가하세요.',
      keys: '단축키', kPlay: '재생/멈춤', kSeek: '5초', kSync: '싱크', kSize: '자막 크기', kFull: '전체 화면',
      noTimes: '{file}: 자막 시간을 못 찾았어요.',
      loaded: '{file}: 자막 {n}개를 불러왔어요', langs: '언어 {k}개', encUsed: '인코딩 {enc}',
      encUnsure: '글자가 깨지면 인코딩을 직접 골라 주세요',
      done: '자막을 다 읽었어요: {list}', count: '{label} {n}개',
      found: '글자 자막 {n}개를 찾았어요. 읽는 중…', noText: '파일 안에 글자 자막이 없어요. 자막 파일을 추가해 보세요.',
      imageSubs: '(그림 자막 {n}개는 못 읽어요)', codecs: '영상 {v} · 음성 {a}', none: '없음',
      opening: '{file} 여는 중…', scanStopped: '자막을 읽다가 멈췄어요: {msg}',
      cantPlay: '이 브라우저가 영상을 재생하지 못해요. Chrome이나 Edge에서 열어 보세요.', cantPlayApp: '이 영상 형식은 재생할 수 없어요.',
      cantOpen: '파일을 열 수 없어요: {p}',
    },
    ja: {
      appName: 'MKV字幕プレーヤー', appNameHtml: 'MKV<b>字幕</b>プレーヤー',
      privacy: 'ファイルはこの端末の中だけで開きます。どこにもアップロードされません。',
      macHint: '⌘O 動画を開く · ⇧⌘O 字幕を追加 · 同じ名前の字幕ファイルは自動で読み込みます',
      dropTitle: 'MKVファイルをここにドロップ、またはクリックして選択',
      dropText: 'ファイル内のテキスト字幕（SRT・ASS）は自動で読み込みます。.srt / .smi / .vtt / .ass ファイルも一緒にドロップできます。',
      openVideo: '動画を開く', addSubs: '字幕ファイルを追加',
      encAuto: '文字コード：自動', encAria: '字幕ファイルの文字コード', encTitle: '文字化けする場合はここで変更してください',
      subsLabel: '字幕', subsAria: '字幕を選択', off: 'オフ', trackN: '字幕 {n}',
      size: '字幕サイズ', sizeAria: '字幕サイズを選択', sizeS: '小', sizeM: '標準', sizeL: '大', sizeXL: '特大',
      sizeDown: '小さく (−)', sizeUp: '大きく (+)', sizeRange: '字幕サイズ（動画の高さに対する%）',
      sync: '同期', syncAria: '字幕のタイミング', syncEarlier: '字幕を0.25秒早く (Z)', syncLater: '字幕を0.25秒遅く (X)', reset: 'リセット',
      subBg: '字幕の背景',
      cast: 'テレビに送る', airplayOn: 'AirPlayでテレビに再生中です。字幕が出ない場合は画面ミラーリングを使ってください。', airplayOff: 'AirPlayを切断しました。',
      airplayFail: 'AirPlayを開けませんでした。', castOn: 'テレビで再生中です。字幕が出ない場合は画面ミラーリングを使ってください。', castOff: 'テレビとの接続を切りました。',
      castNeedVideo: '先に動画を開いてください。', castFail: 'テレビに送れませんでした：{msg}',
      noteBrowser: 'MKVはChrome・Edge・Firefoxで再生できます。iPhoneとMacのSafariはMKVを開けません。',
      noteMac: 'FinderでMKVを右クリック →「このアプリケーションで開く」、またはDockのアイコンにドロップしても開けます。',
      noteTV: 'Apple TVで見るには、コントロールセンターの画面ミラーリングをオンにしてフルスクリーン（F）にしてください。字幕もそのまま映ります。',
      noteCodec: 'AC-3・DTS音声は音が出ないことがあり、H.265（HEVC）動画は端末によって再生できません。',
      noteImage: '画像字幕（PGS、VobSub）は読めません。代わりに.srtや.smiファイルを追加してください。',
      keys: 'ショートカット', kPlay: '再生/一時停止', kSeek: '5秒', kSync: '同期', kSize: '字幕サイズ', kFull: 'フルスクリーン',
      noTimes: '{file}：字幕のタイミングが見つかりません。',
      loaded: '{file}：字幕を{n}件読み込みました', langs: '{k}言語', encUsed: '文字コード {enc}',
      encUnsure: '文字化けする場合は文字コードを手動で選んでください',
      done: '字幕の読み込み完了：{list}', count: '{label} {n}件',
      found: 'テキスト字幕を{n}本見つけました。読み込み中…', noText: 'このファイルにはテキスト字幕がありません。字幕ファイルを追加してください。',
      imageSubs: '（画像字幕{n}本は読めません）', codecs: '映像 {v} · 音声 {a}', none: 'なし',
      opening: '{file} を開いています…', scanStopped: '字幕の読み込みが止まりました：{msg}',
      cantPlay: 'このブラウザではこの動画を再生できません。ChromeかEdgeで開いてください。', cantPlayApp: 'この動画の形式は再生できません。',
      cantOpen: 'ファイルを開けません：{p}',
    },
    'zh-Hans': {
      appName: 'MKV 字幕播放器', appNameHtml: 'MKV <b>字幕</b>播放器',
      privacy: '文件只在本设备上打开，不会上传到任何地方。',
      macHint: '⌘O 打开视频 · ⇧⌘O 添加字幕 · 与影片同名的字幕文件会自动加载',
      dropTitle: '将 MKV 文件拖到这里，或点击选择',
      dropText: '文件内的文字字幕（SRT、ASS）会自动读取。也可以一起拖入 .srt / .smi / .vtt / .ass 文件。',
      openVideo: '打开视频', addSubs: '添加字幕文件',
      encAuto: '编码：自动', encAria: '字幕文件编码', encTitle: '如果出现乱码，请在这里更换编码',
      subsLabel: '字幕', subsAria: '选择字幕', off: '关闭', trackN: '字幕 {n}',
      size: '字幕大小', sizeAria: '选择字幕大小', sizeS: '小', sizeM: '标准', sizeL: '大', sizeXL: '特大',
      sizeDown: '缩小 (−)', sizeUp: '放大 (+)', sizeRange: '字幕大小（占视频高度的百分比）',
      sync: '同步', syncAria: '字幕时间', syncEarlier: '字幕提前 0.25 秒 (Z)', syncLater: '字幕延后 0.25 秒 (X)', reset: '重置',
      subBg: '字幕背景',
      cast: '投放到电视', airplayOn: '正在通过 AirPlay 在电视上播放。如果电视上不显示字幕，请使用屏幕镜像。', airplayOff: '已断开 AirPlay。',
      airplayFail: '无法打开 AirPlay。', castOn: '正在电视上播放。如果电视上不显示字幕，请使用屏幕镜像。', castOff: '已断开电视。',
      castNeedVideo: '请先打开视频。', castFail: '无法投放到电视：{msg}',
      noteBrowser: 'MKV 可在 Chrome、Edge 和 Firefox 中播放。iPhone 和 Mac 上的 Safari 无法打开 MKV。',
      noteMac: '在访达中右键点按 MKV →“打开方式”，或拖到程序坞图标上也能打开。',
      noteTV: '要在 Apple TV 上观看，请在控制中心打开屏幕镜像并全屏（F）。字幕也会一起显示。',
      noteCodec: 'AC-3、DTS 音频可能没有声音，H.265（HEVC）视频取决于设备。',
      noteImage: '无法读取图形字幕（PGS、VobSub）。请另外添加 .srt 或 .smi 文件。',
      keys: '快捷键', kPlay: '播放/暂停', kSeek: '5 秒', kSync: '同步', kSize: '字幕大小', kFull: '全屏',
      noTimes: '{file}：找不到字幕时间。',
      loaded: '{file}：已加载 {n} 条字幕', langs: '{k} 种语言', encUsed: '编码 {enc}',
      encUnsure: '如有乱码，请手动选择编码',
      done: '字幕读取完成：{list}', count: '{label} {n} 条',
      found: '找到 {n} 条文字字幕轨道，正在读取…', noText: '此文件中没有文字字幕。请添加字幕文件。',
      imageSubs: '（{n} 条图形字幕轨道无法读取）', codecs: '视频 {v} · 音频 {a}', none: '无',
      opening: '正在打开 {file}…', scanStopped: '读取字幕时停止：{msg}',
      cantPlay: '此浏览器无法播放该视频。请在 Chrome 或 Edge 中打开。', cantPlayApp: '无法播放此视频格式。',
      cantOpen: '无法打开文件：{p}',
    },
    'zh-Hant': {
      appName: 'MKV 字幕播放器', appNameHtml: 'MKV <b>字幕</b>播放器',
      privacy: '檔案只在這台裝置上開啟，不會上傳到任何地方。',
      macHint: '⌘O 開啟影片 · ⇧⌘O 加入字幕 · 與影片同名的字幕檔會自動載入',
      dropTitle: '將 MKV 檔案拖到這裡，或點按選擇',
      dropText: '檔案內的文字字幕（SRT、ASS）會自動讀取。也可以一起拖入 .srt / .smi / .vtt / .ass 檔案。',
      openVideo: '開啟影片', addSubs: '加入字幕檔',
      encAuto: '編碼：自動', encAria: '字幕檔編碼', encTitle: '如果出現亂碼，請在這裡更換編碼',
      subsLabel: '字幕', subsAria: '選擇字幕', off: '關閉', trackN: '字幕 {n}',
      size: '字幕大小', sizeAria: '選擇字幕大小', sizeS: '小', sizeM: '標準', sizeL: '大', sizeXL: '特大',
      sizeDown: '縮小 (−)', sizeUp: '放大 (+)', sizeRange: '字幕大小（佔影片高度的百分比）',
      sync: '同步', syncAria: '字幕時間', syncEarlier: '字幕提前 0.25 秒 (Z)', syncLater: '字幕延後 0.25 秒 (X)', reset: '重設',
      subBg: '字幕背景',
      cast: '傳送到電視', airplayOn: '正透過 AirPlay 在電視上播放。若電視上沒有字幕，請使用螢幕鏡像輸出。', airplayOff: '已中斷 AirPlay。',
      airplayFail: '無法開啟 AirPlay。', castOn: '正在電視上播放。若電視上沒有字幕，請使用螢幕鏡像輸出。', castOff: '已中斷電視連線。',
      castNeedVideo: '請先開啟影片。', castFail: '無法傳送到電視：{msg}',
      noteBrowser: 'MKV 可在 Chrome、Edge 和 Firefox 中播放。iPhone 與 Mac 上的 Safari 無法開啟 MKV。',
      noteMac: '在 Finder 中按右鍵點 MKV →「打開檔案的應用程式」，或拖到 Dock 圖示上也能開啟。',
      noteTV: '要在 Apple TV 上觀看，請在控制中心開啟螢幕鏡像輸出並全螢幕（F）。字幕也會一起顯示。',
      noteCodec: 'AC-3、DTS 音訊可能沒有聲音，H.265（HEVC）影片視裝置而定。',
      noteImage: '無法讀取圖形字幕（PGS、VobSub）。請另外加入 .srt 或 .smi 檔。',
      keys: '快速鍵', kPlay: '播放/暫停', kSeek: '5 秒', kSync: '同步', kSize: '字幕大小', kFull: '全螢幕',
      noTimes: '{file}：找不到字幕時間。',
      loaded: '{file}：已載入 {n} 則字幕', langs: '{k} 種語言', encUsed: '編碼 {enc}',
      encUnsure: '如有亂碼，請手動選擇編碼',
      done: '字幕讀取完成：{list}', count: '{label} {n} 則',
      found: '找到 {n} 條文字字幕軌，讀取中…', noText: '這個檔案裡沒有文字字幕。請加入字幕檔。',
      imageSubs: '（{n} 條圖形字幕軌無法讀取）', codecs: '影像 {v} · 音訊 {a}', none: '無',
      opening: '正在開啟 {file}…', scanStopped: '讀取字幕時停止：{msg}',
      cantPlay: '這個瀏覽器無法播放這部影片。請在 Chrome 或 Edge 中開啟。', cantPlayApp: '無法播放這種影片格式。',
      cantOpen: '無法開啟檔案：{p}',
    },
    es: {
      appName: 'Reproductor de subtítulos MKV', appNameHtml: 'Reproductor de <b>subtítulos</b> MKV',
      privacy: 'Los archivos se abren solo en este dispositivo. No se sube nada.',
      macHint: '⌘O abrir vídeo · ⇧⌘O añadir subtítulos · los subtítulos con el mismo nombre que la película se cargan solos',
      dropTitle: 'Suelta aquí un archivo MKV o haz clic para elegirlo',
      dropText: 'Los subtítulos de texto del archivo (SRT, ASS) se leen automáticamente. También puedes soltar archivos .srt / .smi / .vtt / .ass.',
      openVideo: 'Abrir vídeo', addSubs: 'Añadir subtítulos',
      encAuto: 'Codificación: automática', encAria: 'Codificación del archivo de subtítulos', encTitle: 'Si ves caracteres extraños, cambia la codificación aquí',
      subsLabel: 'Subtítulos', subsAria: 'Elegir subtítulos', off: 'No', trackN: 'Subtítulos {n}',
      size: 'Tamaño', sizeAria: 'Tamaño de los subtítulos', sizeS: 'Pequeño', sizeM: 'Normal', sizeL: 'Grande', sizeXL: 'Muy grande',
      sizeDown: 'Más pequeño (−)', sizeUp: 'Más grande (+)', sizeRange: 'Tamaño de los subtítulos (% de la altura del vídeo)',
      sync: 'Sincronía', syncAria: 'Sincronía de los subtítulos', syncEarlier: 'Subtítulos 0,25 s antes (Z)', syncLater: 'Subtítulos 0,25 s después (X)', reset: 'Restablecer',
      subBg: 'Fondo',
      cast: 'Enviar a la TV', airplayOn: 'Reproduciendo en la TV con AirPlay. Si no ves los subtítulos en la TV, usa Duplicar pantalla.', airplayOff: 'AirPlay desconectado.',
      airplayFail: 'No se pudo abrir AirPlay.', castOn: 'Reproduciendo en la TV. Si no ves los subtítulos en la TV, duplica la pantalla.', castOff: 'TV desconectada.',
      castNeedVideo: 'Primero abre un vídeo.', castFail: 'No se pudo enviar a la TV: {msg}',
      noteBrowser: 'Los MKV se reproducen en Chrome, Edge y Firefox. Safari en iPhone y Mac no puede abrir MKV.',
      noteMac: 'En el Finder, haz clic derecho en un MKV → Abrir con, o suéltalo sobre el icono del Dock.',
      noteTV: 'Para verlo en el Apple TV, activa Duplicar pantalla en el Centro de control y pon pantalla completa (F). Los subtítulos también se ven.',
      noteCodec: 'El audio AC-3 o DTS puede no sonar, y el vídeo H.265 (HEVC) depende de tu dispositivo.',
      noteImage: 'Los subtítulos de imagen (PGS, VobSub) no se pueden leer. Añade un archivo .srt o .smi.',
      keys: 'Atajos', kPlay: 'reproducir/pausa', kSeek: '5 s', kSync: 'sincronía', kSize: 'tamaño', kFull: 'pantalla completa',
      noTimes: '{file}: no se encontraron tiempos de subtítulos.',
      loaded: '{file}: {n} subtítulos cargados', langs: '{k} idiomas', encUsed: 'codificación {enc}',
      encUnsure: 'si ves caracteres extraños, elige la codificación a mano',
      done: 'Subtítulos listos: {list}', count: '{label} ({n})',
      found: 'Se encontraron {n} pistas de subtítulos de texto. Leyendo…', noText: 'Este archivo no tiene subtítulos de texto. Prueba a añadir un archivo de subtítulos.',
      imageSubs: '({n} pistas de subtítulos de imagen no se pueden leer)', codecs: 'vídeo {v} · audio {a}', none: 'ninguno',
      opening: 'Abriendo {file}…', scanStopped: 'Se detuvo la lectura de subtítulos: {msg}',
      cantPlay: 'Este navegador no puede reproducir el vídeo. Prueba con Chrome o Edge.', cantPlayApp: 'No se puede reproducir el formato de este vídeo.',
      cantOpen: 'No se puede abrir el archivo: {p}',
    },
    pt: {
      appName: 'Player de legendas MKV', appNameHtml: 'Player de <b>legendas</b> MKV',
      privacy: 'Os arquivos abrem só neste aparelho. Nada é enviado.',
      macHint: '⌘O abrir vídeo · ⇧⌘O adicionar legendas · legendas com o mesmo nome do filme entram sozinhas',
      dropTitle: 'Solte um arquivo MKV aqui ou clique para escolher',
      dropText: 'As legendas de texto do arquivo (SRT, ASS) são lidas automaticamente. Você também pode soltar arquivos .srt / .smi / .vtt / .ass.',
      openVideo: 'Abrir vídeo', addSubs: 'Adicionar legenda',
      encAuto: 'Codificação: automática', encAria: 'Codificação do arquivo de legenda', encTitle: 'Se aparecerem caracteres estranhos, troque a codificação aqui',
      subsLabel: 'Legendas', subsAria: 'Escolher legenda', off: 'Desligadas', trackN: 'Legenda {n}',
      size: 'Tamanho', sizeAria: 'Tamanho da legenda', sizeS: 'Pequeno', sizeM: 'Normal', sizeL: 'Grande', sizeXL: 'Muito grande',
      sizeDown: 'Menor (−)', sizeUp: 'Maior (+)', sizeRange: 'Tamanho da legenda (% da altura do vídeo)',
      sync: 'Sincronia', syncAria: 'Sincronia da legenda', syncEarlier: 'Legenda 0,25 s antes (Z)', syncLater: 'Legenda 0,25 s depois (X)', reset: 'Redefinir',
      subBg: 'Fundo',
      cast: 'Enviar para a TV', airplayOn: 'Reproduzindo na TV via AirPlay. Se a legenda não aparecer na TV, use o Espelhamento de Tela.', airplayOff: 'AirPlay desconectado.',
      airplayFail: 'Não foi possível abrir o AirPlay.', castOn: 'Reproduzindo na TV. Se a legenda não aparecer na TV, espelhe a tela.', castOff: 'TV desconectada.',
      castNeedVideo: 'Abra um vídeo primeiro.', castFail: 'Não foi possível enviar para a TV: {msg}',
      noteBrowser: 'MKV toca no Chrome, Edge e Firefox. O Safari do iPhone e do Mac não abre MKV.',
      noteMac: 'No Finder, clique com o botão direito num MKV → Abrir Com, ou solte-o no ícone do Dock.',
      noteTV: 'Para ver na Apple TV, ative o Espelhamento de Tela na Central de Controle e use tela cheia (F). A legenda vai junto.',
      noteCodec: 'Áudio AC-3 ou DTS pode ficar sem som, e vídeo H.265 (HEVC) depende do aparelho.',
      noteImage: 'Legendas em imagem (PGS, VobSub) não podem ser lidas. Adicione um arquivo .srt ou .smi.',
      keys: 'Atalhos', kPlay: 'reproduzir/pausar', kSeek: '5 s', kSync: 'sincronia', kSize: 'tamanho', kFull: 'tela cheia',
      noTimes: '{file}: nenhum tempo de legenda encontrado.',
      loaded: '{file}: {n} legendas carregadas', langs: '{k} idiomas', encUsed: 'codificação {enc}',
      encUnsure: 'se aparecerem caracteres estranhos, escolha a codificação manualmente',
      done: 'Legendas prontas: {list}', count: '{label} ({n})',
      found: '{n} faixas de legenda em texto encontradas. Lendo…', noText: 'Este arquivo não tem legendas em texto. Tente adicionar um arquivo de legenda.',
      imageSubs: '({n} faixas de legenda em imagem não podem ser lidas)', codecs: 'vídeo {v} · áudio {a}', none: 'nenhum',
      opening: 'Abrindo {file}…', scanStopped: 'A leitura das legendas parou: {msg}',
      cantPlay: 'Este navegador não consegue reproduzir o vídeo. Tente o Chrome ou o Edge.', cantPlayApp: 'Não é possível reproduzir o formato deste vídeo.',
      cantOpen: 'Não foi possível abrir o arquivo: {p}',
    },
    de: {
      appName: 'MKV-Untertitel-Player', appNameHtml: 'MKV-<b>Untertitel</b>-Player',
      privacy: 'Dateien werden nur auf diesem Gerät geöffnet. Nichts wird hochgeladen.',
      macHint: '⌘O Video öffnen · ⇧⌘O Untertitel hinzufügen · gleichnamige Untertiteldateien neben dem Film werden automatisch geladen',
      dropTitle: 'MKV-Datei hier ablegen oder zum Auswählen klicken',
      dropText: 'Text-Untertitel in der Datei (SRT, ASS) werden automatisch gelesen. Du kannst auch .srt-, .smi-, .vtt- und .ass-Dateien ablegen.',
      openVideo: 'Video öffnen', addSubs: 'Untertiteldatei hinzufügen',
      encAuto: 'Kodierung: automatisch', encAria: 'Zeichenkodierung der Untertiteldatei', encTitle: 'Wenn Zeichen kaputt aussehen, hier die Kodierung ändern',
      subsLabel: 'Untertitel', subsAria: 'Untertitel wählen', off: 'Aus', trackN: 'Untertitel {n}',
      size: 'Größe', sizeAria: 'Untertitelgröße', sizeS: 'Klein', sizeM: 'Normal', sizeL: 'Groß', sizeXL: 'Sehr groß',
      sizeDown: 'Kleiner (−)', sizeUp: 'Größer (+)', sizeRange: 'Untertitelgröße (% der Videohöhe)',
      sync: 'Sync', syncAria: 'Untertitel-Timing', syncEarlier: 'Untertitel 0,25 s früher (Z)', syncLater: 'Untertitel 0,25 s später (X)', reset: 'Zurücksetzen',
      subBg: 'Hintergrund',
      cast: 'An TV senden', airplayOn: 'Wird per AirPlay auf dem TV abgespielt. Wenn dort keine Untertitel erscheinen, nutze die Bildschirmsynchronisierung.', airplayOff: 'AirPlay getrennt.',
      airplayFail: 'AirPlay konnte nicht geöffnet werden.', castOn: 'Wird auf dem TV abgespielt. Wenn dort keine Untertitel erscheinen, spiegle den Bildschirm.', castOff: 'TV getrennt.',
      castNeedVideo: 'Öffne zuerst ein Video.', castFail: 'Senden an den TV fehlgeschlagen: {msg}',
      noteBrowser: 'MKV läuft in Chrome, Edge und Firefox. Safari auf iPhone und Mac kann keine MKV-Dateien öffnen.',
      noteMac: 'Im Finder eine MKV-Datei rechtsklicken → Öffnen mit, oder sie auf das Dock-Symbol ziehen.',
      noteTV: 'Zum Ansehen auf dem Apple TV im Kontrollzentrum die Bildschirmsynchronisierung einschalten und Vollbild (F) wählen. Die Untertitel kommen mit.',
      noteCodec: 'AC-3- und DTS-Ton bleibt eventuell stumm, H.265-Video (HEVC) hängt vom Gerät ab.',
      noteImage: 'Bild-Untertitel (PGS, VobSub) können nicht gelesen werden. Füge stattdessen eine .srt- oder .smi-Datei hinzu.',
      keys: 'Tastenkürzel', kPlay: 'Wiedergabe/Pause', kSeek: '5 s', kSync: 'Sync', kSize: 'Untertitelgröße', kFull: 'Vollbild',
      noTimes: '{file}: keine Untertitelzeiten gefunden.',
      loaded: '{file}: {n} Untertitel geladen', langs: '{k} Sprachen', encUsed: 'Kodierung {enc}',
      encUnsure: 'wenn Zeichen kaputt aussehen, die Kodierung von Hand wählen',
      done: 'Untertitel bereit: {list}', count: '{label} ({n})',
      found: '{n} Text-Untertitelspuren gefunden. Wird gelesen …', noText: 'Diese Datei enthält keine Text-Untertitel. Füge eine Untertiteldatei hinzu.',
      imageSubs: '({n} Bild-Untertitelspuren können nicht gelesen werden)', codecs: 'Video {v} · Audio {a}', none: 'keine',
      opening: '{file} wird geöffnet …', scanStopped: 'Lesen der Untertitel abgebrochen: {msg}',
      cantPlay: 'Dieser Browser kann das Video nicht abspielen. Versuche es mit Chrome oder Edge.', cantPlayApp: 'Dieses Videoformat kann nicht abgespielt werden.',
      cantOpen: 'Datei kann nicht geöffnet werden: {p}',
    },
    fr: {
      appName: 'Lecteur de sous-titres MKV', appNameHtml: 'Lecteur de <b>sous-titres</b> MKV',
      privacy: 'Les fichiers s’ouvrent uniquement sur cet appareil. Rien n’est envoyé.',
      macHint: '⌘O ouvrir une vidéo · ⇧⌘O ajouter des sous-titres · les sous-titres portant le nom du film sont ajoutés automatiquement',
      dropTitle: 'Déposez un fichier MKV ici ou cliquez pour le choisir',
      dropText: 'Les sous-titres texte du fichier (SRT, ASS) sont lus automatiquement. Vous pouvez aussi déposer des fichiers .srt / .smi / .vtt / .ass.',
      openVideo: 'Ouvrir une vidéo', addSubs: 'Ajouter des sous-titres',
      encAuto: 'Encodage : automatique', encAria: 'Encodage du fichier de sous-titres', encTitle: 'Si des caractères s’affichent mal, changez l’encodage ici',
      subsLabel: 'Sous-titres', subsAria: 'Choisir les sous-titres', off: 'Aucun', trackN: 'Sous-titres {n}',
      size: 'Taille', sizeAria: 'Taille des sous-titres', sizeS: 'Petite', sizeM: 'Normale', sizeL: 'Grande', sizeXL: 'Très grande',
      sizeDown: 'Plus petit (−)', sizeUp: 'Plus grand (+)', sizeRange: 'Taille des sous-titres (% de la hauteur de la vidéo)',
      sync: 'Synchro', syncAria: 'Synchronisation des sous-titres', syncEarlier: 'Sous-titres 0,25 s plus tôt (Z)', syncLater: 'Sous-titres 0,25 s plus tard (X)', reset: 'Réinitialiser',
      subBg: 'Fond',
      cast: 'Envoyer vers la TV', airplayOn: 'Lecture sur la TV via AirPlay. Si les sous-titres n’apparaissent pas sur la TV, utilisez la recopie de l’écran.', airplayOff: 'AirPlay déconnecté.',
      airplayFail: 'Impossible d’ouvrir AirPlay.', castOn: 'Lecture sur la TV. Si les sous-titres n’apparaissent pas sur la TV, recopiez l’écran.', castOff: 'TV déconnectée.',
      castNeedVideo: 'Ouvrez d’abord une vidéo.', castFail: 'Impossible d’envoyer vers la TV : {msg}',
      noteBrowser: 'Les MKV se lisent dans Chrome, Edge et Firefox. Safari sur iPhone et Mac ne peut pas ouvrir les MKV.',
      noteMac: 'Dans le Finder, clic droit sur un MKV → Ouvrir avec, ou déposez-le sur l’icône du Dock.',
      noteTV: 'Pour regarder sur l’Apple TV, activez la recopie de l’écran dans le Centre de contrôle et passez en plein écran (F). Les sous-titres suivent.',
      noteCodec: 'L’audio AC-3 ou DTS peut rester muet, et la vidéo H.265 (HEVC) dépend de votre appareil.',
      noteImage: 'Les sous-titres en image (PGS, VobSub) ne peuvent pas être lus. Ajoutez plutôt un fichier .srt ou .smi.',
      keys: 'Raccourcis', kPlay: 'lecture/pause', kSeek: '5 s', kSync: 'synchro', kSize: 'taille', kFull: 'plein écran',
      noTimes: '{file} : aucun horaire de sous-titre trouvé.',
      loaded: '{file} : {n} sous-titres chargés', langs: '{k} langues', encUsed: 'encodage {enc}',
      encUnsure: 'si des caractères s’affichent mal, choisissez l’encodage à la main',
      done: 'Sous-titres prêts : {list}', count: '{label} ({n})',
      found: '{n} pistes de sous-titres texte trouvées. Lecture…', noText: 'Ce fichier ne contient pas de sous-titres texte. Essayez d’ajouter un fichier de sous-titres.',
      imageSubs: '({n} pistes de sous-titres en image ne peuvent pas être lues)', codecs: 'vidéo {v} · audio {a}', none: 'aucun',
      opening: 'Ouverture de {file}…', scanStopped: 'Lecture des sous-titres interrompue : {msg}',
      cantPlay: 'Ce navigateur ne peut pas lire cette vidéo. Essayez Chrome ou Edge.', cantPlayApp: 'Le format de cette vidéo ne peut pas être lu.',
      cantOpen: 'Impossible d’ouvrir le fichier : {p}',
    },
  };

  // OS / browser languages, most preferred first
  const prefs = (typeof navigator !== 'undefined' && (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language])) || ['en'];

  function pickLang(list) {
    for (const raw of list) {
      const l = String(raw || '').toLowerCase();
      if (l.startsWith('zh')) return /hant|-tw|-hk|-mo/.test(l) ? 'zh-Hant' : 'zh-Hans';
      const base = l.split('-')[0];
      if (S[base]) return base;
    }
    return 'en';
  }
  const lang = pickLang(prefs);
  const dict = S[lang];

  function t(key, vars) {
    let s = dict[key] != null ? dict[key] : (S.en[key] != null ? S.en[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }

  // ISO 639-2 (MKV tracks) -> 639-1, for language names and matching the user's languages
  const ISO3 = { kor: 'ko', eng: 'en', jpn: 'ja', chi: 'zh', zho: 'zh', spa: 'es', por: 'pt', ger: 'de', deu: 'de', fre: 'fr', fra: 'fr',
    ita: 'it', rus: 'ru', pol: 'pl', tur: 'tr', ara: 'ar', heb: 'he', gre: 'el', ell: 'el', dut: 'nl', nld: 'nl', swe: 'sv', nor: 'no',
    nob: 'nb', nno: 'nn', dan: 'da', fin: 'fi', cze: 'cs', ces: 'cs', hun: 'hu', rum: 'ro', ron: 'ro', vie: 'vi', ind: 'id', tha: 'th',
    ukr: 'uk', bul: 'bg', hrv: 'hr', srp: 'sr', slo: 'sk', slk: 'sk', slv: 'sl', may: 'ms', msa: 'ms', hin: 'hi', per: 'fa', fas: 'fa',
    lit: 'lt', lav: 'lv', est: 'et', cat: 'ca', ice: 'is', isl: 'is', fil: 'fil', tam: 'ta', tel: 'te', ben: 'bn', urd: 'ur' };
  function iso1(code) {
    if (!code) return '';
    const c = String(code).toLowerCase().replace('_', '-');
    if (c === 'und' || c === 'mul' || c === 'zxx') return '';
    return ISO3[c] || c.split('-')[0];
  }
  let dn = null;
  try { dn = new Intl.DisplayNames([lang], { type: 'language' }); } catch (e) { /* old browser */ }
  function langName(code) {
    const c = iso1(code);
    if (!c) return '';
    try { const n = dn && dn.of(c); if (n && n.toLowerCase() !== c) return n; } catch (e) { /* unknown code */ }
    return c.toUpperCase();
  }
  // index of the user's language list a subtitle language matches (lower = better, Infinity = no match)
  const prefBases = prefs.map(p => String(p).toLowerCase().split('-')[0]);
  function prefRank(code) {
    const c = iso1(code);
    const i = c ? prefBases.indexOf(c) : -1;
    return i < 0 ? Infinity : i;
  }

  // Fill static markup: data-i18n (text), data-i18n-html, data-i18n-title, data-i18n-aria
  function apply(rootEl) {
    const r = rootEl || document;
    r.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    r.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    r.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    r.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.documentElement.lang = lang;
    document.title = t('appName');
  }

  root.I18N = { t, lang, prefs, langName, prefRank, iso1, apply, languages: Object.keys(S) };
})(window);
