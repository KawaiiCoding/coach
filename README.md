# Tension Coach

A calm, voice-guided daily coach for posture-related tension. Tap where it bothers you (or skip), pick what your day
looks like, press play. A coach voice talks you through each move with music under it, so you can stay hands-off.
It installs to the home screen, works offline, and keeps all data on the device.

## Deploy to GitHub Pages
1. Create a repository and upload the contents of this folder to its root (`index.html`, `manifest.webmanifest`,
   `sw.js`, `css/`, `js/`, `icons/`).
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. After about a minute the app is live at `https://<your-user>.github.io/<repo>/`.
4. On the phone open that address. iPhone: Safari → Share → "Add to Home Screen". Android: Chrome → "Install app".
5. After changing files, bump `CACHE` in `sw.js` (v5 → v6) so phones fetch the new version.

To try it locally: `python3 -m http.server` in this folder, then open http://localhost:8000/.

## What is in it
- **First run:** three light screens: body map (front and back, 30+ spots), what your day mostly looks like, a one-tap
  safety check. Light, dark or automatic appearance from the first screen.
- **Today:** one session built for you, in a safe order: warm up (moving drills only), strengthen, lengthen (static
  stretches on warm tissue), then slow breathing as the cool-down. A body scan is added at 20 minutes.
- **Resets:** 2 to 6 minute routines for a moment in the day: before or after a walk, run or ride, after sitting,
  off the sofa, desk break, phone neck, before bed.
- **Player:** full screen, auto-advancing, with pause, skip, coach voice on/off and music on/off. The coach gives
  the instructions bit by bit, what to focus on, what to avoid, and encouragement. Music is upbeat for warm-ups
  and strength, lighter for stretches, and soft pads for breathing (the screen dims to dusk); it ducks under the voice.
- **Program:** week view, stage 1 to 4, what your plan lengthens and strengthens (with pictures), and settings.
- **Learn:** short reads: how the plan works, why this order, breathing, your areas, pain rules, when to see a doctor.

## Files
- `js/app.js` screens, session engine and player · `js/coach.js` voice and generated music · `js/illus.js` figures
- `js/data/resets.js` quick routines and daily tips · other `js/data/` files: muscles, postures, stretches, strength,
  breathing, regions, stages, coaching, mindful, women's health, body chart images

## Limits
The content follows published guidance (ACSM, NICE, NHS, ACOG, Royal Osteoporosis Society; listed under Learn →
Sources) but has not been reviewed by a clinician, and the posture model is an estimate. It does not diagnose.
