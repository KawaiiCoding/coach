"""Pre-record every coach line with a natural neural voice, so the coach sounds the same on every device.

1. Export the lines: open the app, then in the browser console run
       copy(JSON.stringify(COACH_LINES()))
   and paste the result into tools/coach_lines.json (re-run after changing exercises or coach text).
2. Record:  pip install edge-tts && python3 tools/record_voice.py
   Clips go to audio/coach/<id>.m4a (AAC, mono) plus audio/coach/index.json. Existing clips are skipped.

Licensing: edge-tts uses Microsoft Edge's read-aloud service unofficially. Fine for personal use and testing.
Before publishing in an app store, re-record the same lines through Azure AI Speech (same voices, licensed)."""
import asyncio, json, os, shutil, subprocess, sys, tempfile
import edge_tts

VOICE, RATE, PITCH = "en-US-AndrewNeural", "-6%", "-2Hz"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "audio", "coach")
AAC = shutil.which("afconvert") is not None          # macOS: AAC at 32 kbps; elsewhere keep the MP3
EXT = "m4a" if AAC else "mp3"


async def one(line, sem, tmp):
    dest = os.path.join(OUT, f"{line['id']}.{EXT}")
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return "skip"
    async with sem:
        for attempt in range(4):
            try:
                mp3 = os.path.join(tmp, line["id"] + ".mp3")
                await edge_tts.Communicate(line["text"], VOICE, rate=RATE, pitch=PITCH).save(mp3)
                if AAC:
                    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "32000", "-c", "1", mp3, dest], check=True, capture_output=True)
                else:
                    shutil.move(mp3, dest)
                return "ok"
            except Exception as e:  # network hiccups: back off and retry
                await asyncio.sleep(1.5 * (attempt + 1))
        print("failed:", line["text"][:60], file=sys.stderr)
        return "fail"


async def main():
    lines = json.load(open(os.path.join(ROOT, "tools", "coach_lines.json")))
    os.makedirs(OUT, exist_ok=True)
    sem = asyncio.Semaphore(6)
    with tempfile.TemporaryDirectory() as tmp:
        res = await asyncio.gather(*(one(l, sem, tmp) for l in lines))
    files = sorted(f.rsplit(".", 1)[0] for f in os.listdir(OUT) if f.endswith("." + EXT))
    json.dump({"voice": VOICE, "ext": EXT, "files": files}, open(os.path.join(OUT, "index.json"), "w"))
    print({k: res.count(k) for k in ("ok", "skip", "fail")}, "clips in index:", len(files))


asyncio.run(main())
