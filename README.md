# cableprinter

Physical cable definitions for tscircuit assemblies: connector pairs, connector
dimensions, insulated wires and jacket cross sections. This package defines the
cable independently of its placement, route and 3D mesh.

```ts
import { getCableDefinition, parseCableString } from "@tscircuit/cableprinter"

const usb = parseCableString("usb_c")
const motorCable = parseCableString("jst_ph_pins4")
const sensorCable = getCableDefinition({
  standard: "jst_sh",
  pinCount: 4,
  wireDiameter: 0.6,
})
const powerCord = parseCableString("us_mains")
```

## Cable types

All dimensions are in millimeters. `wireDiameter` includes insulation;
`jacketDiameter` is the outside diameter of the complete jacket.

| Standard | Connector A / connector B | Defaults | Options |
| --- | --- | --- | --- |
| `usb_c` | USB-C plug / USB-C plug | 4 mm round jacket | `jacketDiameter`, `color` |
| `jst_sh` | JST SH housing / JST SH housing, 1 mm pitch | 4 pins, 0.6 mm insulated wires | `pinCount` (2–15), `wireDiameter` (0.4–0.8 mm) |
| `jst_ph` | JST PH housing / JST PH housing, 2 mm pitch | 2 pins, 1.2 mm insulated wires | `pinCount` (2–16), `wireDiameter` (0.8–1.5 mm) |
| `us_mains` | NEMA 5-15P / IEC C13 | 6.2 mm round jacket | `jacketDiameter`, `color` |

The string DSL accepts `usb_c`, `us_mains`, `jst_sh[_pinsN]` and
`jst_ph[_pinsN]`. Use the object form for cross-section options. Invalid names,
unknown suffixes and out-of-range pin counts throw. Input schemas are strict.

`getCableDefinition` returns a JSON-serializable `CableDefinition` with
`standard`, `connectorA`, `connectorB` and `crossSection`. Both the input and
normalized definition have exported Zod schemas. A JST bundle has one insulated
wire per connector contact. Its colors distinguish wires in the gallery; they
do not define an electrical pin mapping. USB and mains describe the outside
jacket, without inferring internal conductor wiring or electrical ratings.

Each connector's local mating face is centered on x/y at z=0, with its cable
exit along +z. An assembly places these local frames at its resolved endpoints.

## Gallery and snapshots

![Common cables with definition code and connector details](tests/__snapshots__/common-cables.snap.png)

![JST SH and PH pin-count comparisons at the same face scale](tests/__snapshots__/jst-pin-counts.snap.png)

![Three independent cables in a device](tests/__snapshots__/multi-cable-device.snap.png)

```sh
bun install
bun run start        # Cosmos: common cables, JST variants, multiple cables, playground
bun run build:site   # Static Cosmos gallery in cosmos-export/
bun test
bun run test:update  # Explicitly regenerate annotated PNG/SVG snapshots
bun run typecheck
bun run format:check
```

The gallery uses SVG illustrations, with code at left and cable/connector
details at right. Its authored curves are presentation fixtures. They do not
implement automatic routing, sagging or clearance checks. The illustrations
live outside `lib` and are not included in the published package. Snapshot tests
use a bundled OFL font for consistent rendering across platforms and produce
diff images on failure.

## Dimensions and references

- [JST SH drawing](https://www.jst-mfg.com/product/pdf/eng/eSH.pdf), housing table:
  SH without side protrusions (`SHR-xxV-S-B`), width `pinCount + 1`, height 2.8,
  depth 5. Insulation range 0.4–0.8 mm.
- [JST PH drawing](https://www.jst-mfg.com/product/pdf/eng/ePH.pdf), PHR housing
  table: width `(pinCount - 1) * 2 + 3.8`, height 4.5, depth 6.85. The default
  wire range corresponds to SPH-002 contacts.
- [Amphenol USB-C plug drawing](https://cdn.amphenol-cs.com/media/wysiwyg/files/drawing/10133475.pdf):
  nominal 8.25 x 2.4 mm shell face. Shell depth and overmold dimensions are
  representative visualization defaults.
- [Interpower cord-set reference](https://www.interpower.com/docs/connections_2_6-04.pdf):
  NEMA 5-15 to IEC C13 with representative 6.2 mm jacket diameter (3 x 18 AWG SVT).
  Molded body dimensions and contact illustrations are representative envelopes.

These definitions support assembly visualization, not connector manufacturing
or electrical certification.

## Package boundaries

`lib` contains schemas, defaults and string parsing. World endpoints and the
resolved cable path belong to the assembly/routing layer and Circuit JSON.
Mesh generation belongs in a separate renderer (for example jscad-electronics
or a Manifold adapter). The renderer consumes the definition and resolved path;
it should not choose or recompute the route. Several cables are simply several
independent definitions, each paired with its own path.

This initial package does not yet integrate these standards into
`<assembly.cable>` or generate Circuit JSON cable paths.

## Bootstrap and publishing

Follows the [tscircuit handbook bootstrap guide](https://github.com/tscircuit/handbook/blob/main/guides/bootstrapping-repos.md):
`lib/index.ts` source entrypoint, `files: ["lib"]`, no lockfile, Biome, Bun test,
typecheck/format workflows, Cosmos and Vite aliases. Templates are from
`@tscircuit/plop`; the GitHub Packages release template omits its build step
and frozen-lockfile installation because this package publishes TypeScript
source directly.

After the first release, install via the public package proxy:

```sh
bun add https://jscdn.tscircuit.com/@tscircuit/cableprinter/<version>
```
