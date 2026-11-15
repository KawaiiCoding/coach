# Tension Coach

A mobile-first daily coach for posture-related tension and pain: tap where you feel it, tell it about your day,
and it builds a session of warm-up, breathing, strengthening, stretching and a guided body scan, then tracks
your progress. It installs to the home screen, works offline, and keeps all data on the device.

## Deploy to GitHub Pages
1. Create a repository and upload the contents of this folder to its root (`index.html`, `manifest.webmanifest`,
   `sw.js`, `css/`, `js/`, `icons/`).
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. After about a minute the app is live at `https://<your-user>.github.io/<repo>/`.
4. On the phone open that address. iPhone: Safari → Share → "Add to Home Screen". Android: Chrome → "Install app".
5. After changing files, bump `CACHE` in `sw.js` (v4 → v5) so phones fetch the new version.

To try it locally: `python3 -m http.server` in this folder, then open http://localhost:8000/.

## What is in it
- **Setup:** woman / man, osteoporosis, two safety screens (breathlessness lying flat, red flags), a women's health
  step (general health, painful periods, pregnancy, after birth, menopause, leaking, heaviness, pelvic pain),
  a body chart with tap dots and symptom types, and your typical day.
- **Today:** a staged session with timers. Figures move for exercises with movement, every timer can be paused,
  and each exercise shows where to feel it, what you should and should not feel, what to focus on and what to avoid.
- **Log, Progress, Learn:** daily check-in, pain trend, the four programme stages, diaphragm training, a guided
  body scan, evidence notes per body region, pain rules and sources.

## Files
- `js/today.js` app logic · `js/illus.js` figures and movement · `js/kinematics.js` posture model · `js/plan.js` dose text
- `js/data/` muscles, postures, stretches, strength, breathing, regions, stages, coaching, mindful (body scan,
  attention), women (sex-specific rules, pelvic floor), bodyimg (chart outlines)

## Limits
The content follows published guidance (ACSM, NICE, NHS, ACOG, Royal Osteoporosis Society; listed under Learn →
Sources) but has not been reviewed by a clinician, and the posture model is an estimate. It does not diagnose.
