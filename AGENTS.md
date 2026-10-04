# cableprinter

- Follow the tscircuit handbook's bootstrap and code conventions.
- `lib` owns cable strings, schemas, connector dimensions and cross sections.
- Placement, route generation, sagging and mesh generation belong in consumers.
- Visual snapshots must render actual 3D meshes with poppygl. Mesh generation belongs in jscad-electronics, consumed as a dev dependency.
- Keep annotated snapshots paired with the code that defines each cable.
- Run tests, typecheck, format check and gallery build before opening a PR.
- Update snapshots explicitly with `bun run test:update` and inspect the PNGs.
