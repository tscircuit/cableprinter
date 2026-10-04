import { expect } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { Resvg } from "@resvg/resvg-js"
import looksSame from "looks-same"

export async function expectSvgSnapshot({
  svg,
  name,
}: {
  svg: string
  name: string
}) {
  const snapshotDir = join(import.meta.dir, "..", "__snapshots__")
  mkdirSync(snapshotDir, { recursive: true })
  const pngPath = join(snapshotDir, `${name}.snap.png`)
  const png = new Resvg(svg, {
    font: {
      loadSystemFonts: false,
      fontFiles: [join(import.meta.dir, "RobotoMono.ttf")],
      defaultFontFamily: "Roboto Mono",
    },
  })
    .render()
    .asPng()
  const update =
    process.argv.includes("-u") ||
    process.argv.includes("--update-snapshots") ||
    process.env.BUN_UPDATE_SNAPSHOTS === "1"
  if (update) {
    writeFileSync(pngPath, png)
    writeFileSync(join(snapshotDir, `${name}.snap.svg`), svg)
    return
  }
  if (!existsSync(pngPath))
    throw new Error(`Missing snapshot ${pngPath}; run bun run test:update`)
  const result = await looksSame(png, readFileSync(pngPath), {
    tolerance: 2,
    antialiasingTolerance: 2,
  })
  if (!result.equal) {
    await looksSame.createDiff({
      reference: pngPath,
      current: png,
      diff: pngPath.replace(".snap.png", ".diff.png"),
      highlightColor: "#ff00ff",
    })
  }
  expect(result.equal, `Snapshot mismatch: ${name}`).toBe(true)
}
