# CLAUDE.md — The Endling Saga website

This file tells any AI assistant how to work on this project. Read it fully before making changes.

## What this is
A custom HTML/CSS/JS "rhizomatic navigation engine" for The Endling Saga, an original transmedia IP by Matt Griffin (Griff), a professional illustrator/author. The site is an ambient, exploratory "click GO DEEPER and see what surfaces" experience — the reference is the old Internet K-hole: genuine randomness with faint narrative threads emerging for attentive visitors. ~260 node pages. No framework, no build step. Hosted on Netlify, auto-deploys from GitHub on push.

## The person
Matt cannot code. He directs the technical work and handles all visual/creative work himself. He is a domain expert in illustration, narrative, and his own IP. He wants expert, analytical, succinct, honest collaboration — never sycophancy, never overpromising, never AI-generated filler. Lead with independent analysis; push back if the data disagrees with him.

## HARD RULES (these caused real damage when broken)

1. NEVER generate creative or lore content to fill gaps. All node text is verbatim from Matt's source documents (the glossary and old-site-text .txt files). If text is missing, insert a clear placeholder and flag it. Do not invent, paraphrase, or "improve" lore.

2. Output ONLY the specific files that changed in each build. Never a full-site zip unless asked. Matt hand-edits files between builds; a full zip overwrites his work. If more than ~12 files changed, zip just those.

3. ONE category of change per build, then stop and let Matt test. This project has a strong history of fixes breaking other things. Subtle, targeted changes only.

4. After editing js/engine.js: ALWAYS run a syntax check (node -e) AND confirm that getLastNode, setLastNode, ELEVATIONS, and STRANDS_ANOMALY are all declared BEFORE smartRandom uses them, AND that recordVisit() contains all five calls: addVisited, addToRecentFour, incrementVisitCount, incrementClicks, setLastNode. Missing any of these silently kills the GO buttons or the whole nav system. This has happened repeatedly.

5. When stuck on CSS/layout, ask Matt to paste the browser inspector "Computed" styles for the broken element. Diagnose from real rendered values, do not guess.

6. DO NOT TOUCH (working, hard-won): the navigation weighting system (smartRandom logic, the elevation map, recent-four penalty, Ontic Loop trigger); the character page layouts (portrait and landscape). Only change these if Matt explicitly asks.

7. No em-dashes anywhere, ever. Use a hyphen " - " in structural/display contexts (titles, headings, labels, data attributes) and a comma in running prose. Avoid "it's not X, it's Y" sentence constructions.

8. File access: .docx and .md uploads have repeatedly failed to reach the sandbox (suspected OneDrive corruption). Plain .txt files created by pasting are reliable. Ask Matt to provide source content as .txt or pasted text.

## CSS / type conventions
- Font sizes use rem units (already done sitewide). The root font-size is set on `html` with a responsive clamp; all rem scales from there. To make all type bigger/smaller, adjust the single root rule, do not touch individual sizes.
- Do NOT retrofit a utility-class type system (text-sm etc.) onto the existing 260 nodes — too risky for a near-finished site. The single-root approach gives the same scalability.
- All backgrounds are near-black #060606. No dark blue, no zone-coloured page backgrounds. Matt is explicit and repeated on this.
- Fonts: Bebas Neue (display), Space Mono (mono), IM Fell English (prose).

## Folder structure
```
endling-engine-2/
├── css/engine.css        (ONE file only)
├── js/engine.js
├── nodes/*.html          (~260)
├── images/{endling,hwr,domum,leonard,anomalies,misc}/
├── video/  gifs/  audio/  favicons/  glb/
├── index.html  holding.html  about.html  ontic-loop.html   (root, NOT in nodes/)
└── CLAUDE.md
```

## Navigation engine (js/engine.js) — reference, do not modify without instruction
- Session tracking in sessionStorage: es_visited, es_recent4, es_visit_counts, es_last_node, es_clicks.
- smartRandom(pool): after 3 clicks filter to unvisited; apply pool weight (all 1 or 2); contextual elevation x1.3 for one jump if the node is an elevation target of the last node; ANOMALY cap at 1.2; recent-four penalty (idx0 x0.05, idx1 x0.1, idx2 x0.2, idx3 x0.35); exhausted-fallback x1.5 for non-recent nodes; weighted random pick.
- The strand-assignment system was REMOVED. No STRANDS object, no getOrAssignStrand. Navigation = pool weights + elevation + penalties only.
- Ontic Loop: in the GO DEEPER handler, if getVisitCount(picked url) >= 2, navigate to ../ontic-loop.html instead. Fires on the 3rd visit to any node. Visit counts reset on index.html load only, NOT on return from ontic-loop.
- Pool invariants to preserve: all weights 1 or 2; zero unreachable nodes (every node in >=3 inbound pools); glossary nodes weighted 1 (down-weighted so they surface less); map.html and img-engine-vista.html appear in ~20-25 pools each as orientation off-ramps; nothing over-dominant.

## Source documents (the ONLY content source)
- Glossary: ~92 entries, dry darkly-funny voice, verbatim.
- Old-site text: full verbatim V1 text, all character bios and song lyrics. Tone differs by strand (Leonard crude first-person; High Wail Rook mythic; Acid Cola/3Moons corporate satire) — never interchangeable.
- Provide these as .txt or pasted text.

## Deploy flow
Edit local files → GitHub Desktop commit + push → Netlify auto-builds (~30s) → hard refresh (Ctrl+Shift+R).
