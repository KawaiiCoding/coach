# Tension Coach

A calm, voice-guided daily coach for posture-related tension. Tap where it bothers you (or skip), pick what your day
looks like, press play. A coach voice talks you through each move with music under it, so you can stay hands-off.
It installs to the home screen, works offline, and keeps all data on the device.

## Run locally
Needs Node 18 or newer (no packages to install).

    npm start          # http://localhost:8000
    npm run build      # clean site in dist/, cache version stamped automatically
    npm run preview    # build, then serve dist/ at http://localhost:8001 (exactly what GitHub Pages serves)

Open the app through these addresses, not by double-clicking index.html: the recorded coach voice only loads from a server.

## Deploy to GitHub Pages
1. Push this folder to a GitHub repository (branch `main`).
2. Settings, Pages, Source: "GitHub Actions".
3. Every push to `main` builds and publishes automatically (`.github/workflows/pages.yml`). The site appears at
   `https://<your-user>.github.io/<repo>/`.
4. On the phone open that address. iPhone: Safari, Share, "Add to Home Screen". Android: Chrome, "Install app".
   The build stamps a new cache version each time, so installed apps update by themselves.

## What is in it
- **First run:** three light screens: body map (front and back, 30+ spots), what your day mostly looks like, a one-tap
  safety check. Light, dark or automatic appearance from the first screen.
- **Today:** one session built for you, in a safe order: warm up (moving drills only), strengthen, lengthen (static
  stretches on warm tissue), then slow breathing as the cool-down. A body scan is added at 20 minutes.
- **Quickies:** 2 to 6 minute routines for a moment in the day: before or after a walk, run or ride, after sitting,
  off the sofa, desk break, phone neck, before bed.
- **Player:** full screen, auto-advancing, with pause, skip, coach voice on/off and music on/off. The coach gives
  the instructions bit by bit, what to focus on, what to avoid, and encouragement. Music is original and generated on the
  phone (nothing to license): feel-good pop at 104 bpm for warm-ups and strength, a laid-back groove for stretches,
  soft pads for breathing (the screen dims to dusk). It ducks under the voice. The coach voice defaults to the best
  male voice on the device; Program, Coach voice lists the best few with a sample button.
- **Program:** week view, stage 1 to 4, what your plan lengthens and strengthens (with pictures), and settings.
- **Learn:** short reads: how the plan works, why this order, breathing, your areas, pain rules, when to see a doctor.

## Files
- `js/app.js` screens, session engine and player · `js/coach.js` voice and generated music · `js/illus.js` figures
- `js/data/resets.js` Quickies (quick routines) and daily tips · other `js/data/` files: muscles, postures, stretches, strength,
  breathing, regions, stages, coaching, mindful, women's health

## Coach voice recordings
Every line the coach says is pre-recorded with the natural "Andrew" voice in `audio/coach/` (about 1,230 clips,
22 MB, loaded only when needed). Anything not recorded falls back to the device voice. After changing exercises
or coach text: open the app, run `copy(JSON.stringify(COACH_LINES()))` in the browser console, paste into
`tools/coach_lines.json`, then `pip install edge-tts && python3 tools/record_voice.py` (only new lines are recorded).
Note: edge-tts uses Microsoft Edge's read-aloud service unofficially; re-record through Azure AI Speech before
publishing in an app store.

## Limits
The content follows published guidance (ACSM, NICE, NHS, ACOG, Royal Osteoporosis Society; listed under Learn →
Sources) but has not been reviewed by a clinician, and the posture model is an estimate. It does not diagnose.
