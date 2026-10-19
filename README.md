# BlueTrace

BlueTrace is an immersive ocean education website. Follow a diver through a damaged reef, explore the hidden factors behind water quality, and practice responsible diving choices.

## The journey

1. **Witness** — observe murky water, reef damage, and drifting plastic.
2. **Trace Lab** — explore dissolved oxygen, turbidity, pH, and microplastics through educational interactions.
3. **Practice Dive** — practice keeping distance, avoiding contact, judging litter retrieval, and respecting marine life.
4. **Diver Passport** — record learning progress, samples, skills, and an ocean pledge.

Visual improvements are educational feedback, not a claim that a real ecosystem recovers instantly. The passport is a learning record, not a diving qualification.

## Run locally

This is a static HTML, CSS, and vanilla JavaScript project. No package installation, API key, or build step is required for local preview.

```sh
git clone https://github.com/panleyan4-dev/bluetrace.git
cd bluetrace
python3 -m http.server 8000
```

Open http://localhost:8000 in a modern browser. Keep the `assets/` directory beside `index.html` so videos, audio, images, and scripts can load. Audio is an optional enhancement.

## Project files

- `index.html` — the current combined experience and entry point.
- `style.css`, `script.js` — shared presentation and interactions.
- `witness-video.js`, `witness-world.js` — Witness scene implementations.
- `assets/` — runtime media, localization, Passport modules, and vendored dependencies.
- `index.source.html` — an earlier Witness source kept for project context; it is not the combined entry point.
- `AGENTS.md` — project direction, accessibility goals, and collaboration rules. Read it completely before making changes.

This repository contains a curated snapshot of the current website. Local hosting configuration, generated deployment folders, QA captures, reference-site screenshots, and unused media drafts are excluded. Existing design goals in `AGENTS.md` are not a guarantee that every feature has passed a fresh browser audit.

## Rights and attribution

This is a public source repository. No project-wide open-source license has been selected yet. Public visibility does not grant blanket permission to reuse the BlueTrace identity, code, imagery, video, or audio. Confirm the relevant rights with their owners before reuse.

The bundled Three.js r128 dependency retains its MIT license in `assets/vendor/THREE-LICENSE.txt`. That dependency license does not apply to the whole project. A complete provenance and redistribution-license inventory for project media is still pending.

Scientific source links appear within the educational content. Simulated values and visual feedback should not be treated as field measurements or ecological predictions.
