import { test } from "bun:test"
import { catalogSvg } from "../pages/components/catalog-svg"
import { jstComparisonSvg } from "../pages/components/jst-comparison-svg"
import { multiCableSvg } from "../pages/components/multi-cable-svg"
import { expectSvgSnapshot } from "./fixtures/expect-svg-snapshot"

test("common cables pair definition code with annotated illustrations", async () => {
  await expectSvgSnapshot({ name: "common-cables", svg: catalogSvg() })
})

test("JST 2-, 4- and 6-pin housings compare at the same scale", async () => {
  await expectSvgSnapshot({ name: "jst-pin-counts", svg: jstComparisonSvg() })
})

test("a device can use separate USB, motor and mains cable definitions", async () => {
  await expectSvgSnapshot({ name: "multi-cable-device", svg: multiCableSvg() })
})
