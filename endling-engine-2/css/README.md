# THE ENDLING SAGA — ENGINE SITE

## FOLDER STRUCTURE

```
endling-engine/
│
├── index.html          ← Homepage (the threshold)
├── holding.html        ← Holding page (goes live first while you build)
├── about.html          ← What is this? (very discreet)
│
├── css/
│   └── engine.css      ← All styles, design system, zones
│
├── js/
│   └── engine.js       ← Navigation system (weighted random)
│
├── nodes/
│   ├── _template.html  ← COPY THIS for every new node
│   ├── entry.html      ← First node after homepage
│   ├── koa.html        ← Example: character node
│   └── [your nodes]   ← Add as many as you like
│
└── images/
    └── [your images]   ← All images go here
```

---

## IMAGES TO ADD

Upload these to the `/images/` folder and name them exactly as shown:

| File name              | What it is                                      |
|------------------------|-------------------------------------------------|
| `east-to-engine.jpg`   | Homepage hero (Leonard silhouette, purple sky)  |
| `engine-door.jpg`      | Entry node bg (Leonard at door, Latin visible)  |
| `koa-endling.jpg`      | Koa node bg (red/black/cream bike image)        |

Add more images as you build more nodes. Any filename works — just
reference it in the node's CSS background-image or img src.

---

## DEPLOYING TO NETLIFY (first time)

1. Go to https://netlify.com — sign up free (use your GitHub or Google account)
2. From the dashboard, click **"Add new site" → "Deploy manually"**
3. Drag your entire `endling-engine` folder onto the upload area
4. Netlify gives you a random URL (e.g. `amazing-feynman-abc123.netlify.app`)
5. Your site is live

**To point your existing domain (theendlingsaga.io) to Netlify:**
1. In Netlify: Site settings → Domain management → Add custom domain
2. Follow the DNS instructions (you'll add/change two records in your domain registrar)
3. Takes 10–60 minutes to propagate

**To update the site after changes:**
- Drag the folder onto Netlify again (it replaces everything)
- Or connect to a GitHub repo for automatic deploys on push

---

## HOLDING PAGE

While you build the full site, make `holding.html` your homepage:
- Rename `index.html` to `index-wip.html`
- Rename `holding.html` to `index.html`
- Deploy

When you're ready to launch the real site:
- Rename `index.html` back to `holding.html`
- Rename `index-wip.html` back to `index.html`
- Deploy

---

## ADDING A NEW NODE

1. Duplicate `nodes/_template.html`
2. Rename it (e.g. `nodes/irla.html`)
3. Edit:
   - `<title>` — change to node name
   - Zone class on `<main>` — pick from: `zone-newkyushu`, `zone-continent`, `zone-domum`, `zone-engine`
   - Background image reference
   - Content (title, prose, fragment, or image)
   - `initDeeperButton([...])` — list 3–6 connected nodes with weights
   - `data-coords` — optional easter egg string
4. Upload any new images to `/images/`
5. Make sure other nodes can link to this one (add it to their deeper pools)

---

## ZONE COLOURS (world signals)

| Class              | World            | Colour feel         |
|--------------------|------------------|---------------------|
| `zone-newkyushu`   | Koa's world      | Deep purple-black   |
| `zone-continent`   | High Wail Rook   | Deep green-black    |
| `zone-domum`       | Origin / Domum Novum | Warm ochre-black |
| `zone-engine`      | The Engine       | Engine red-black    |
| (no class)         | Liminal / unknown | Pure void          |

---

## WEIGHTED RANDOM — HOW IT WORKS

Each node defines a pool of possible "go deeper" destinations:

```javascript
initDeeperButton([
  { url: 'koa.html',       weight: 3 },  // 3x more likely than weight 1
  { url: 'leonard.html',   weight: 2 },
  { url: 'agnar.html',     weight: 1 },  // dot connector — rare but there
]);
```

Higher weight = more likely to be chosen.
Use this to create soft thematic paths without hard linearity.
Strange connections get low weight — they exist, they just don't dominate.

---

## THE COORDINATES EASTER EGG

Every node has a `.coordinates` element in the bottom right corner.
It's tiny and barely visible (opacity: 0.15).
Set `data-coords=""` to any string — real coordinates, a date,
a cryptic phrase, a lore hint.
Leave it empty and nothing shows.

Only the most attentive visitors will ever find these.
That is the point.
