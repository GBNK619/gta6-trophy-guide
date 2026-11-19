# TROPHY GUIDE HQ

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![entry rank](https://make.fun/badge/gta6-trophy-guide-01/GBNK619/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![entry reward](https://make.fun/badge/gta6-trophy-guide-01/GBNK619/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

A complete trophy guide and platinum tracker for **Grand Theft Auto VI** on PlayStation 5, built for the make.fun bounty [“Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

TROPHY GUIDE HQ covers all **55 official trophies** (the official PS5 list, as published via Exophase). Every trophy carries an original guide written from its official description — no copied walkthrough text — with its source cited in the detail view. Trophies are classified by kind (story, collectible, cumulative, skill, exploration, completion, special), and the few whose official descriptions imply a one-time event carry a cautious, description-based **missable flag** with the reasoning shown.

## Features

- **Tracker** — tick off earned trophies; progress bar, percentage, per-grade counts (platinum / gold / silver / bronze) and how many trophies stand between you and the platinum. Progress persists in `localStorage`.
- **Export / import** — download your progress as a JSON file and import it on any device.
- **Filters & search** — by grade, by kind, by earned status, missable-only, plus name/description search.
- **Spoiler setting** — hides (blurs) the names and descriptions of story trophies until you earn them.
- **Roadmap to platinum** — a four-phase route: story and flagged missables first, exploration and collectibles second, cumulative grinds and skill feats third, then 100% completion and the platinum. Each entry shows the official description that places it in its phase.
- **Detail view per trophy** — official description, grade, kind, missable badge and reasoning, the full guide, and its source citation.
- **Sources & Method** — an in-app section stating where the trophy data comes from, how the guides were derived, how kinds were assigned, and how missable flags were decided.
- Fully static and offline: no build step, no network requests, no external assets.

## Run it

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

or open `app/index.html` through any static file server. Node 22, standard library only.

## Entry plumbing

`main.ts` is the make.fun entry program: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library in `vendor/` (left byte-for-byte untouched, as the scorer requires). Outside the grader's container:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`screenshots/` holds four 1280×800 JPEG views of the app (the first by name is the cover); `shots.json` records which views they are.

## License

MIT — see `LICENSE`. TROPHY GUIDE HQ is a fan-made guide, not affiliated with Rockstar Games, Take-Two Interactive or Sony Interactive Entertainment. Trophy names and descriptions are the official PlayStation 5 list text; the guides are original writing derived from those descriptions.
