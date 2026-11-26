# MKV 자막 플레이어

MKV 영상을 자막과 함께 보는 플레이어. 맥 앱(Electron)과 브라우저에서 여는 웹 버전, MKV → MP4 변환 스크립트가 있어요.

## 할 수 있는 것

- MKV 안에 든 글자 자막(SRT·ASS·SSA·WebVTT, zlib 압축 포함)을 직접 읽어서 표시
- 따로 있는 자막 파일: `.srt` `.smi`/`.sami` `.vtt` `.ass`/`.ssa`
  - SMI는 언어(Class)마다 따로 나눠서 고를 수 있음 (한국어·영어 등)
  - 인코딩 자동 판별(UTF-8 / EUC-KR / Windows-1252 / UTF-16), 직접 고를 수도 있음
- 자막 크기(영상 높이 기준이라 전체 화면에서도 같은 비율), 싱크 ±0.25초, 자막 배경 켜고 끄기
- 단축키: `Space` 재생/멈춤 · `←` `→` 5초 · `Z` `X` 싱크 · `−` `+` 자막 크기 · `F` 전체 화면

못 하는 것: 그림 자막(PGS, VobSub), ASS 꾸밈(색·위치), AC-3·DTS 음성(브라우저 엔진이 못 풂).

## 폴더

| 폴더 | 내용 |
| --- | --- |
| `mac/` | 맥 앱. Finder "다음으로 열기"·Dock에 끌어다 놓기, 영화 옆 같은 이름 자막(`영화.srt`, `영화.ko.smi`) 자동으로 붙이기, ⌘O / ⇧⌘O |
| `web/` | 한 파일짜리 웹 플레이어 (`index.html`). Chrome·Edge·Firefox에서 열기. Safari는 MKV 재생 안 됨 |
| `tools/mkv2mp4.sh` | MKV → MP4 변환(ffmpeg). 영상은 가능하면 그대로 복사, 음성은 AAC, 글자 자막은 MP4 자막으로. `--burn`이면 자막을 영상에 새김. AirPlay·Apple 기기용 |

## 맥 앱 만들기

```bash
cd mac
npm install
npm start            # 개발용으로 바로 실행
npm run pack:arm64   # Apple Silicon 앱 → mac/dist/
npm run pack:x64     # 인텔 맥 앱
```

Apple 개발자 인증서로 서명하지 않은 앱이라, 다른 곳에서 받은 앱을 처음 열 땐 한 번 이렇게 해 줘야 해요.

```bash
xattr -cr "/Applications/MKV 자막 플레이어.app"
codesign --force --deep --sign - "/Applications/MKV 자막 플레이어.app"
```

## MP4로 바꾸기

```bash
brew install ffmpeg
tools/mkv2mp4.sh 영화.mkv            # 자막을 켜고 끌 수 있는 MP4
tools/mkv2mp4.sh --burn 영화.mkv     # 자막을 영상에 새김 (어디서나 보임, 느림)
```

`web/index.html`과 `mac/index.html`은 거의 같은 플레이어예요. 맥 쪽은 웹 글꼴·AirPlay 버튼을 빼고 파일 경로로 열기를 더했어요. 플레이어를 고치면 두 파일을 같이 고치세요.
