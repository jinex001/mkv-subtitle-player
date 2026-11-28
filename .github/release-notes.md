**Web version (no install):** https://jinex001.github.io/mkv-subtitle-player/ — Chrome, Edge or Firefox.

**Mac app:** download the zip for your Mac — `arm64` for Apple Silicon (M1/M2/M3/M4), `x64` for Intel.

The app isn't notarized by Apple yet, so macOS blocks it on first launch. After moving it to Applications, run once in Terminal:

```bash
xattr -cr "/Applications/MKV Subtitle Player.app"
```

### New in 1.1.0
- **Fix sound**: movies with AC-3, E-AC-3, DTS or TrueHD audio played silently. The app now notices and offers *Fix sound*: it re-encodes only the audio to AAC with ffmpeg (install once with `brew install ffmpeg`), saves `Movie (AAC).mkv` next to the original and continues where you were
- **Subtitles inside MP4/MOV files** (mov_text, WebVTT) are shown, like MKV subtitle tracks
- Subtitle files named `Movie.ru.srt` show up as "Russian · Movie"

### What's in it
- Subtitles inside MKV files (SRT, ASS/SSA, WebVTT) are read while the video plays
- `.srt`, `.smi`/`.sami`, `.vtt`, `.ass`/`.ssa` files; multi-language SMI is split per language
- Automatic encoding detection for old subtitle files: UTF-8/16, EUC-KR, Shift_JIS, GBK, Big5, Windows-1250…1258, KOI8-R
- Interface in English, 한국어, 日本語, 简体中文, 繁體中文, Español, Português, Deutsch, Français — follows your system language
- Mac app: Open With from Finder, drop on the Dock icon, subtitle files next to the movie are added automatically
- Subtitle size, timing ±0.25 s, background toggle, keyboard shortcuts
