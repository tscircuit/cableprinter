import { test } from "bun:test"
import { renderBulletCatalog } from "./fixtures/render-cable-snapshots"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"

test("single and grouped bullet cables render male and female contacts", async () => {
  await expectPngSnapshot({
    name: "bullet-cables",
    png: await renderBulletCatalog(),
  })
}, 30000)
