import { test } from "bun:test"
import { renderBulletCatalog } from "./fixtures/render-cable-snapshots"
import { bulletAdapterExamples } from "../pages/bullet-adapter-examples"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"

test("3.5 mm to 4 mm adapters show each end and one wire per contact", async () => {
  await expectPngSnapshot({
    name: "bullet-adapter-cables",
    png: await renderBulletCatalog(
      bulletAdapterExamples,
      "Bullet adapter cables / independent mating diameters",
    ),
  })
}, 30000)
