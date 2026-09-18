# 🥭 GNANA PAZHAM — THE RACE OF WISDOM

> *“Speed can win a race. Wisdom can win the world.”*

A browser-based **3D low-poly mythological runner** built with **Three.js / WebGL**.
Play as **Ganesha**, race **Murugan** and his Peacock through three celestial Graha worlds
— **Surya**, **Chandra** and **Mangala** — solve Wisdom Challenges, then sprint the
**Final 100 Metres** to Mount Kailasa, where Shiva and Parvati award the **Gnana Pazham**.

One full playthrough takes about **6–8 minutes**.

---

## ▶ Run it

```bash
npm install
npm run dev          # local dev server (also reachable from phones on the same Wi-Fi)
npm run build        # production build → dist/
npm run preview      # serve the production build
npm run build:single # dist-single/index.html — the whole game in ONE html file
```

### Deploy (public URL)
`dist/` is a static site with relative paths, so it works on any static host:

* **Netlify / Vercel**: build command `npm run build`, publish directory `dist`
* **GitHub Pages**: push the contents of `dist/` to a `gh-pages` branch
* **itch.io**: zip the contents of `dist/` (or upload `dist-single/index.html`) as an HTML game

No accounts, passwords or personal data are collected. Only the best score (and the mute
setting) is stored locally in the browser with `localStorage`.

---

## 🎮 Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Move left / right | `A` `D` or `←` `→` | Swipe left / right |
| Jump | `W`, `↑` or `Space` | Swipe up |
| Slide | `S` or `↓` (in the air: fast-drop) | Swipe down |
| Pause | `Esc` / `P` or ⏸ button | ⏸ button |
| Quiz answers | `1`–`4` or `A`–`D` | Tap |

Obstacles: **low walls / lava / rolling boulders → jump**, **overhead arches → slide**,
**tall pillars / meteors → change lane**. You have **3 lives**.

---

## 🧭 Game flow

```
BOOT → MAIN_MENU → STORY
     → WISDOM_CHALLENGE (Quiz)    → RUNNING  Surya   (500 m, easy — Murugan runs beside you for 100 m, then flies off)
     → WISDOM_CHALLENGE (Memory)  → RUNNING  Chandra (550 m, medium — rolling moon-orbs appear)
     → WISDOM_CHALLENGE (Connect) → RUNNING  Mangala (600 m, hard — lava pools & falling meteors)
     → FINAL_RACE  (100 m on Kailasa, Ganesha vs Murugan side by side)
     → ENDING (cinematic) → RESULT → Play Again / Main Menu
PAUSED and GAME_OVER can interrupt any run.
```

## 🏆 Scoring (all values are real, nothing is faked)

| Source | Points |
| --- | --- |
| Ladoo | +10 each |
| Modak (5 s boost, magnet, speed) | +25 each |
| Quiz (2 questions) | +100 per correct answer (max 200) |
| Memory pairs | 30 per pair + efficiency bonus 80 − 10 per miss (max 200) |
| Connect symbols | 50 per first-try match, 20 after a mistake (max 200) |
| Race bonus (reach Kailasa) | 500 + 100 per remaining life |

**FINAL GNANA SCORE** = sum of the above. The best score is saved locally.

---

## 🗂 Architecture

```
src/
  main.js                       entry point
  styles.css                    all UI styling (responsive, safe-area aware)
  game/
    Game.js                     orchestrator: renderer, systems, UI, state flow
    GameState.js                state machine (BOOT … RESULT)
    GameLoop.js                 rAF loop with clamped delta
    CameraRig.js                follow camera, cinematic shots, orbit, shake, FOV
    SpawnDirector.js            fair obstacle rows, ladoo trails, modak placement
    config.js                   ALL tuning: lanes, physics, sections, difficulty, rival curve
  player/
    Ganesha.js                  procedural low-poly Ganesha (+ Mooshika companion)
    PlayerController.js         lanes, jump, slide, fast-drop, hits, boost, hitbox
    AnimationController.js      pose-blended procedural animation (run/jump/fall/slide/hit/bow/pray/ride/celebrate)
  world/
    BaseWorld.js                sky, background, recycled track & scenery chunks, ambient motes
    SuryaWorld.js / ChandraWorld.js / MangalaWorld.js / KailasaWorld.js
    WorldManager.js             registry + atmosphere (fog, lights, exposure)
    props.js                    shared temple / tree / mountain / cloud / lotus builders
  obstacles/
    ObstacleFactory.js          per-world obstacle meshes + collision volumes
    ObstacleManager.js          pooling, movement (movers, meteors), AABB collision
  collectibles/
    Ladoo.js                    instanced ladoos (2 draw calls for all of them)
    Modak.js                    pooled modak boosters
  rival/
    Murugan.js                  Murugan + Peacock model and behaviour modes
    RivalSystem.js              designed lead curve, hit/boost modifiers, notifications
  characters/Divine.js          Shiva, Parvati, lotus throne, Gnana Pazham
  cinematics/EndingCinematic.js timeline-driven ending (pradakshina, fruit reveal)
  challenges/                   ChallengeHost + Quiz / Matching / Connect challenges
  ui/                           HUD, menus, story, pause, results, notifications, ending captions
  audio/AudioManager.js         procedural Web-Audio music + SFX (no audio files)
  fx/                           GPU particles, speed lines
  utils/                        input (keyboard + swipe), score, storage, math, low-poly & mesh baking helpers
```

### Adding a new Graha
1. Create `src/world/ShaniWorld.js` extending `BaseWorld` (override `theme`, `buildBackground`, `buildChunk`).
2. Register it in `REGISTRY` inside `WorldManager.js`.
3. Add a palette in `ObstacleFactory.js` and a section entry in `SECTIONS` (`config.js`).

### Replacing placeholder art with GLB models
All characters are built from primitives with named joints (`body`, `torso`, `head`, `legL`, …).
To use a rigged GLB, load it with `GLTFLoader`, add it to `PlayerController.object`, and drive it
with `THREE.AnimationMixer` instead of `AnimationController` — the gameplay code only talks to
`PlayerController`.

## ⚡ Performance notes
* Static scenery, obstacles and character parts are **merged per material** at load time
  (`utils/merge.js`) → roughly 150–300 draw calls including the shadow pass.
* Ladoos are one `InstancedMesh`; particles are one `Points` draw call.
* Track and scenery chunks are **recycled**, obstacles and modaks are **pooled** — nothing is
  allocated during a run.
* Mobile devices get no MSAA, a lower pixel-ratio cap and smaller shadow maps; an adaptive
  quality step lowers resolution / shadows further if the frame rate drops below ~42 fps.
* All shaders are pre-compiled during the loading screen.

## ✅ Testing
The game was verified with automated Playwright runs on desktop (1280×720) and mobile
portrait (390×844): menu → story → all 3 challenges → all 3 worlds → final race → ending →
result → Play Again, plus pause / restart / mute / game-over / main-menu. A scripted bot
also completed every section to check that obstacle patterns are always passable.
Add `?debug` to the URL to expose `window.__game` for testing.

## 🙏 Cultural note
The story is the traditional tale of Ganesha, Murugan and the Gnana Pazham. All divine
figures are depicted with care: serene, dignified and never comedic.
