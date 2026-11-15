# Tension Coach + Body Tension Map

An offline web app that shows where posture puts load, shortening and pain risk on 60 muscle groups,
and builds a stretch-and-strength routine to rebalance them. No installation and no internet needed.

## Two apps in one folder
- `index.html` (or `tension-coach.html`): **Tension Coach**, the mobile-first daily app. Onboarding with safety screening,
  a tap-where-it-hurts body chart, a daily session with timers (breathing, stretches, strengthening, body scan),
  a daily log, progress charts and a Learn section (diaphragm training, meditation, what the evidence says per region).
  Everything is stored in the browser's local storage on your device; nothing is sent anywhere.
- `explorer.html` (or `tension-explorer.html`): the 3D muscle explorer with posture presets and the .glb model loader.

On a phone: copy `tension-coach.html` to the phone (or open it from cloud storage) and open it in the browser; add it to the
home screen for an app-like experience. Local storage is per browser, so keep using the same one.

## Deploy to GitHub Pages (installable app)
1. Create a repository on GitHub (for example `tension-coach`) and upload the contents of this folder to its root
   (`index.html`, `explorer.html`, `manifest.webmanifest`, `sw.js`, `css/`, `js/`, `icons/`).
2. In the repository: Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. After a minute the app is live at `https://<your-user>.github.io/tension-coach/`.
4. On the phone, open that address in Safari (iPhone) or Chrome (Android). iPhone: Share → "Add to Home Screen".
   Android: the browser offers "Install app" or use the menu → "Add to Home screen". It then opens full-screen,
   works offline, and keeps your data on the device.
5. When you update files, change `CACHE` in `sw.js` (v1 → v2) so phones fetch the new version.

## Run it
1. Unzip the folder.
2. Double-click `index.html` (daily app) or `explorer.html` (3D explorer) (any modern browser: Chrome, Edge, Firefox, Safari).
   If your browser blocks local files, run `python3 -m http.server` inside the folder and open
   http://localhost:8000/ instead.
3. Or open the single-file build `tension-app.html`, which has everything embedded.

## Using it
- **Posture**: pick a preset (standing, desk, 14 sofa positions, 4 sleeping positions) or move the sliders.
  Joint angles are measured the way a clinician would (relative to the trunk); "Time held" matters more
  than the angle for shortening and soreness.
- **3D view**: drag to orbit, wheel to zoom, shift-drag to pan, click a muscle to pin it, double-click to
  zoom to it. The Load / Length / Pain risk buttons change the colouring; Peel hides the superficial layer
  so you can see deep muscles; Skin toggles the translucent body.
- **Body chart**: the same muscles on a front/back outline; dashed outlines are deep muscles.
- **Pinned muscle**: origin, insertion, action, nerve, which muscles tense with it (amber) and which should
  let go (teal), plus matching stretches and strengthening.
- **Suggested routine**: a balance check across eight antagonist pairs, then warm-up, mobility, stretches
  for shortened or overworked muscles and strengthening for lengthened or inhibited ones, with a weekly plan.
- **Library**: 64 stretches and 58 strengthening exercises with illustrations, doses and cues.

## Loading a real anatomy model (.glb)
Use the "Real anatomy model" file picker. The app reads glTF-binary files, scales the model to the figure,
and matches each mesh to a muscle group by its name (for example "Pectoralis_major.L", "Gluteus maximus right").
Matched meshes take the load / length / pain colouring and respond to clicks; bones and skin are recognised by
name; anything else stays grey. A loaded model is posed automatically: each vertex follows its nearest bones of the app's skeleton, so postures apply, but joints bend crudely (muscles do not deform anatomically).
Z-Anatomy (Blender, CC-BY-SA) exports well: File > Export > glTF 2.0, format "glTF Binary", keep object names.

## What the model is and is not
- Skeleton: a 10-segment model scaled to a 175 cm male, sagittal plane plus shoulder and hip abduction.
  Twisting and side-bending are not modelled.
- Muscles: curves between textbook attachment sites. Length change is geometric, damped for muscles that
  wrap a ball joint. Load combines gravity torque, hand load and postural tone. Pain risk grows with load
  held over time, with shortening and with pressure against furniture.
- Anatomy follows Gray's Anatomy and Moore's Clinically Oriented Anatomy; exercise doses follow the ACSM
  Guidelines for Exercise Testing and Prescription; the tight/weak grouping follows Janda's crossed
  syndromes, a clinical framework with mixed evidence.
- This is an educational model. It has not been reviewed by a clinician and it does not diagnose.
  See a professional for pain after injury, pain that wakes you, numbness or weakness, or pain that does
  not settle within about two weeks.

## Files
- `index.html`, `css/style.css` - page and styles
- `js/kinematics.js` - skeleton, scenes, tension model
- `js/data/muscles.js` - 60 muscles with anatomy, links, attachments and chart positions
- `js/data/postures.js` - presets
- `js/data/stretches.js`, `js/data/strength.js` - exercise libraries
- `js/illus.js` - stick-figure illustrations
- `js/gl.js`, `js/scene3d.js` - WebGL renderer and scene
- `js/chart.js`, `js/plan.js`, `js/app.js` - chart, routine builder, UI
