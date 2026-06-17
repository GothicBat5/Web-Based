A lightweight, self-contained web viewer for inspecting 3D models exported from Blender. Supports `.glb`, `.gltf`, `.obj`, and `.fbx`.

## Running it

Browsers block JavaScript modules from loading over the `file://` protocol, so this needs to be served rather than opened by double-clicking `index.html`. Any of these work:

```bash
# Python (built into most systems)
cd turntable-3d-viewer
python3 -m http.server 8000
# then open http://localhost:8000

# Node
npx serve .
```

Or use an editor extension like VS Code's "Live Server."

## Controls

- **Orbit** — left-click drag
- **Pan** — right-click drag
- **Zoom** — scroll wheel
- **Upload** — toolbar button, the "Browse files" button on the empty state, or drag a file straight onto the window

## Toolbar

Reset view, wireframe toggle, grid toggle, auto-rotate (turntable spin), backdrop contrast (light/dark), and a model-info panel with vertex/triangle/material counts and dimensions.

## Notes

- `.glb` is the most reliable format since it's self-contained — textures and materials are embedded in one file.
- `.gltf` (non-binary) works for geometry but won't resolve textures/buffers that live in separate files, since only the file you pick gets read.
- `.obj` loads geometry; it won't pull in a companion `.mtl` material file.
- Everything runs client-side — no model data leaves the browser.

Built with [Three.js](https://threejs.org/).
