import { test } from "bun:test"
import { renderBulletCatalog } from "./fixtures/render-cable-snapshots"
import { bulletAdapterExamples } from "../pages/bullet-adapter-examples"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"

test("generic adapters show independent ends and wire fanout", async () => {
  await expectPngSnapshot({
    name: "bullet-adapter-cables",
    png: await renderBulletCatalog(
      bulletAdapterExamples,
      "Adapter cables / independently specified connectors",
    ),
  })
}, 30000)
