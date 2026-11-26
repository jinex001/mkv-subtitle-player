#!/usr/bin/env bash
# mkv2mp4.sh — MKV를 AirPlay·Apple 기기에서 재생되는 MP4로 바꿈 (자막 포함)
#
# 쓰는 법:
#   ./mkv2mp4.sh 영화.mkv [다른.mkv ...]          자막을 켜고 끌 수 있는 MP4 (빠름)
#   ./mkv2mp4.sh --burn 영화.mkv                  자막을 영상에 새겨 넣음 (어디서나 보임, 느림)
#   ./mkv2mp4.sh --burn --sub 2 영화.mkv          새겨 넣을 자막 고르기 (안쪽 글자 자막 순서, 1부터)
#
# 같은 폴더에 영화.srt / 영화.ko.srt 같은 자막 파일이 있으면 같이 넣음.
# 결과: 같은 폴더에 영화.mp4 (이미 있으면 영화 (mp4).mp4)
# 필요: ffmpeg (맥: brew install ffmpeg)
set -euo pipefail

burn=0; subpick=1; files=()
while [ $# -gt 0 ]; do
  case "$1" in
    --burn) burn=1 ;;
    --sub) shift; subpick="${1:?--sub 뒤에 번호를 쓰세요}" ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) files+=("$1") ;;
  esac
  shift
done
[ ${#files[@]} -gt 0 ] || { sed -n '2,12p' "$0"; exit 1; }
command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null || {
  echo "ffmpeg가 없어요. 맥이면: brew install ffmpeg"; exit 1; }

# 스트림 목록: "번호|종류|코덱|언어" 한 줄씩
streams() {
  ffprobe -v error -show_entries stream=index,codec_type,codec_name:stream_tags=language \
    -of compact=p=0 "$1" | awk -F'|' '{i=t=c="";l="und"
      for(k=1;k<=NF;k++){split($k,a,"=");if(a[1]=="index")i=a[2];else if(a[1]=="codec_type")t=a[2];
        else if(a[1]=="codec_name")c=a[2];else if(a[1]=="tag:language"&&a[2]!="")l=a[2]}
      print i"|"t"|"c"|"l}'
}

convert() {
  local in="$1"
  [ -f "$in" ] || { echo "파일이 없어요: $in"; return 1; }
  local base="${in%.*}" out="${in%.*}.mp4"
  [ "$out" = "$in" ] || [ -e "$out" ] && out="$base (mp4).mp4"
  echo "▶ $in"

  local args=(-hide_banner -loglevel warning -stats -i "$in")
  local tmp="" maps=() codecs=() vcount=0 acount=0 scount=0 textn=0 burnidx=-1 vcopy=1

  # 같은 이름의 바깥 자막 파일 (영화.srt, 영화.ko.srt …)
  local ext=() f
  for f in "$base".srt "$base".*.srt "$base".vtt "$base".*.vtt "$base".ass "$base".*.ass; do
    [ -f "$f" ] && ext+=("$f")
  done
  for f in ${ext[@]+"${ext[@]}"}; do args+=(-sub_charenc UTF-8 -i "$f"); done

  local line idx type codec lang
  while IFS='|' read -r idx type codec lang; do
    case "$type" in
      video)
        # 표지 그림(mjpeg/png)은 빼고 첫 영상만
        [ $vcount -gt 0 ] && continue
        case "$codec" in mjpeg|png) continue ;; esac
        maps+=(-map "0:$idx")
        case "$codec" in
          h264) codecs+=(-c:v:0 copy) ;;
          hevc) codecs+=(-c:v:0 copy -tag:v:0 hvc1) ;;  # hvc1 태그가 있어야 Apple이 재생함
          *)    codecs+=(-c:v:0 libx264 -crf 20 -preset medium -pix_fmt yuv420p); vcopy=0 ;;
        esac
        vcount=1 ;;
      audio)
        maps+=(-map "0:$idx")
        if [ "$codec" = aac ]; then codecs+=(-c:a:$acount copy)
        else codecs+=(-c:a:$acount aac -b:a:$acount 192k); fi
        codecs+=(-metadata:s:a:$acount language="$lang")
        acount=$((acount+1)) ;;
      subtitle)
        case "$codec" in
          subrip|ass|ssa|webvtt|mov_text|text)
            textn=$((textn+1))
            [ $textn -eq "$subpick" ] && burnidx=$idx
            if [ $burn -eq 0 ]; then
              maps+=(-map "0:$idx")
              codecs+=(-c:s:$scount mov_text -metadata:s:s:$scount language="$lang")
              scount=$((scount+1))
            fi ;;
          *) echo "  그림 자막($codec)은 MP4에 못 넣어서 건너뜀" ;;
        esac ;;
    esac
  done < <(streams "$in")

  [ $vcount -eq 1 ] || { echo "  영상 트랙이 없어요"; return 1; }

  if [ $burn -eq 1 ]; then
    # 자막을 새기려면 영상을 다시 인코딩해야 함
    # 파일 이름의 ' : 같은 글자가 필터를 깨지 않도록 단순한 이름의 임시 링크를 씀
    tmp=$(mktemp -d)
    if [ $burnidx -ge 0 ]; then
      ln -s "$(cd "$(dirname "$in")" && pwd)/$(basename "$in")" "$tmp/in.mkv"
      args+=("${maps[@]}" -vf "subtitles=$tmp/in.mkv:si=$((subpick-1))")
    elif [ ${#ext[@]} -gt 0 ]; then
      cp "${ext[0]}" "$tmp/sub.${ext[0]##*.}"
      args+=("${maps[@]}" -vf "subtitles=$tmp/sub.${ext[0]##*.}")
    else
      echo "  새길 글자 자막이 없어서 그냥 변환해요"; args+=("${maps[@]}")
    fi
    # 영상 코덱 설정을 다시 인코딩으로 바꿈
    local c2=() i=0
    while [ $i -lt ${#codecs[@]} ]; do
      case "${codecs[$i]}" in
        -c:v:0) c2+=(-c:v:0 libx264 -crf 20 -preset medium -pix_fmt yuv420p); i=$((i+2)); continue ;;
        -tag:v:0) i=$((i+2)); continue ;;
      esac
      c2+=("${codecs[$i]}"); i=$((i+1))
    done
    codecs=("${c2[@]}")
  else
    args+=("${maps[@]}")
    local n=1
    for f in ${ext[@]+"${ext[@]}"}; do
      local l=und
      case "$f" in *.ko.*|*.kor.*) l=kor ;; *.en.*|*.eng.*) l=eng ;; *.de.*|*.ger.*|*.deu.*) l=ger ;; esac
      args+=(-map "$n:0"); codecs+=(-c:s:$scount mov_text -metadata:s:s:$scount language=$l)
      scount=$((scount+1)); n=$((n+1))
    done
    # 첫 자막을 기본으로 켜 둠
    [ $scount -gt 0 ] && codecs+=(-disposition:s:0 default)
  fi

  ffmpeg "${args[@]}" "${codecs[@]}" -map_metadata 0 -map_chapters 0 -movflags +faststart -y "$out"
  [ -n "$tmp" ] && rm -rf "$tmp"
  local what="자막 ${scount}개"; [ $burn -eq 1 ] && what="자막 새겨 넣음"
  [ $vcopy -eq 1 ] && [ $burn -eq 0 ] && what="$what, 영상은 그대로 복사"
  echo "  완료: $out ($what)"
}

for f in "${files[@]}"; do convert "$f"; done
