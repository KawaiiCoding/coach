#!/bin/sh
# Prepare the licensed music tracks for the app: even loudness, soft fades at both ends (so the loop point is gentle),
# 128 kbps. The short piano piece is chained six times with 3 s crossfades so it runs about 2:45 before it loops.
# Originals live in tools/music-src/ (not deployed); results go to audio/music/.
set -e; cd "$(dirname "$0")/.."; S=tools/music-src; O=audio/music; mkdir -p $O
ffmpeg -y -v error -i $S/poradovskyi-funk-funky-music-628015.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.4,afade=t=out:st=121.3:d=3" -ar 44100 -b:a 128k $O/energy.mp3
ffmpeg -y -v error -i $S/folk_acoustic-nature-walk-124997.mp3 -af "loudnorm=I=-17:TP=-1.5:LRA=11,afade=t=in:d=0.6,afade=t=out:st=320:d=4" -ar 44100 -b:a 128k $O/walk.mp3
P=$S/shorts_by_pazuzustudio-minimalist-peaceful-piano-for-mindful-meditatio-545247.mp3
ffmpeg -y -v error -i $P -i $P -i $P -i $P -i $P -i $P -filter_complex "[0][1]acrossfade=d=3:c1=tri:c2=tri[a];[a][2]acrossfade=d=3:c1=tri:c2=tri[b];[b][3]acrossfade=d=3:c1=tri:c2=tri[c];[c][4]acrossfade=d=3:c1=tri:c2=tri[d];[d][5]acrossfade=d=3:c1=tri:c2=tri[e];[e]loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:d=1.5,afade=t=out:st=159:d=4[o]" -map "[o]" -ar 44100 -b:a 128k $O/calm.mp3
ls -la $O
