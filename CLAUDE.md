# Tension Coach: rules for any work on the coach figure

These apply to every change to the 2D or 3D figure, its moves, props and the engine. No exceptions.

1. **Medically correct.** Every pose and every movement must be one a healthy, flexible person can do safely. Joints move only the way real joints move, inside real ranges (the limits live in `js/fig3d/limits.js` and the solvers). Check exercise form against published guidance before adding or changing a move; if sources disagree, follow the app's own instruction text and say so.
2. **Nothing passes through anything.** No hand, arm, leg, foot or prop may enter the body, the head, the other limbs, the mat or a prop. Contact is fine; crossing is not.
3. **No glitches.** No bouncing, jitter, snapping, popping or sudden jumps, however small. A hand, foot or head never changes direction twice within half a second.
4. **Smooth, natural movement.** Movements start and stop gently, at a human pace, along the path a person would take.
5. **Props are real.** A band is tied to something visible and held by a handle; a support is something visible to hold; weights are gripped.
6. **Prove it, on both figures.** Run `npm run test:figure` (it checks every move on the man's and the woman's figure and writes `js/fig3d/ok.js`). A move is shown in 3D only if it passes every rule on both; otherwise it keeps its 2D picture. Then look at rendered pictures of the move before saying it is done. If a rule is too weak to catch a problem a person can see, strengthen the rule, do not work round it.
7. **The picture shows what the coach says.** Read the exercise's instruction text (`how` and `cue` in `js/data/`) and make the move match it: which leg is straight, where the hands are, what stays on the floor, what lifts. Floor moves declare their contacts (`floor: { on: [...], off: [...] }`) and the test enforces them.
8. **After any change**, bump `CACHE` in `sw.js`, or the app keeps serving old files.

Style: orange and white palette with a warm dark mode, no emoji, minimal text.
