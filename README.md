# Novel Character Map

A small web app to visualize the characters in a novel you're reading and how
they relate to each other. Characters are nodes; relationships are labeled edges
in an interactive force-directed graph.

## Features

- Add / edit / delete characters (name, role, group)
- Add relationships with a label ("sister", "rival", "mentor"…), optionally
  directed (draws an arrow)
- Interactive graph: drag to rearrange, scroll to zoom, click a character to
  highlight just their connections
- Characters are colored by **group** (family, faction, …)
- Everything is saved automatically in your browser (localStorage)
- Export / import the whole map as JSON, or start blank with **New**

The app ships seeded with a small _Pride and Prejudice_ example so it isn't
empty on first run. Use **New** to clear it and start on your own novel.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5180.

## Build

```bash
npm run build
npm run preview
```

## Stack

Vite · React · TypeScript · [Cytoscape.js](https://js.cytoscape.org/) with the
`fcose` layout.
