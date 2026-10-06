import { test } from "bun:test"
import {
  renderCableCatalog,
  renderJstComparison,
  renderMultipleCables,
} from "./fixtures/render-cable-snapshots"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"

test("common cables render actual 3D meshes with poppygl", async () => {
  await expectPngSnapshot({
    name: "common-cables",
    png: await renderCableCatalog(),
  })
}, 30000)
test("JST variants show three-dimensional housings and conductor counts", async () => {
  await expectPngSnapshot({
    name: "jst-pin-counts",
    png: await renderJstComparison(),
  })
})
test("separate cable paths generate a multi-cable 3D assembly", async () => {
  await expectPngSnapshot({
    name: "multi-cable-device",
    png: await renderMultipleCables(),
  })
})
