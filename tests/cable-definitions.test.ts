import { expect, test } from "bun:test"
import {
  cableDefinitionSchema,
  cableInputSchema,
  getCableDefinition,
  parseCableString,
} from "../lib"

test("standard strings resolve to connector pairs and validated physical definitions", () => {
  const expected = [
    ["usb_c", "usb_c_plug", "usb_c_plug"],
    ["jst_sh_pins4", "jst_sh_housing", "jst_sh_housing"],
    ["jst_ph_pins2", "jst_ph_housing", "jst_ph_housing"],
    ["us_mains", "nema_5_15p", "iec_c13"],
  ] as const
  for (const [cableString, kindA, kindB] of expected) {
    const cable = parseCableString(cableString)
    expect(cable.connectorA.kind).toBe(kindA)
    expect(cable.connectorB.kind).toBe(kindB)
    expect(cableDefinitionSchema.parse(cable)).toEqual(cable)
  }
})

test("JST widths, pitch, wire diameters and conductor counts match manufacturer housing tables", () => {
  for (const standard of ["jst_sh", "jst_ph"] as const) {
    const maxPins = standard === "jst_sh" ? 15 : 16
    for (let pinCount = 2; pinCount <= maxPins; pinCount++) {
      const cable = getCableDefinition({ standard, pinCount })
      expect(cable.connectorA.bodyWidth).toBeCloseTo(
        standard === "jst_sh" ? pinCount + 1 : 2 * pinCount + 1.8,
      )
      expect(cable.connectorB).toEqual(cable.connectorA)
      if (
        !("pitch" in cable.connectorA) ||
        cable.crossSection.kind !== "wire_bundle"
      )
        throw new Error("Expected a JST bundle")
      expect(cable.connectorA.pitch).toBe(standard === "jst_sh" ? 1 : 2)
      expect(cable.crossSection.wires).toHaveLength(pinCount)
      expect(cable.crossSection.wires[0]!.diameter).toBe(
        standard === "jst_sh" ? 0.6 : 1.2,
      )
    }
  }
})

test("USB shell dimensions and mains jacket default are independent of placement", () => {
  const usb = getCableDefinition({ standard: "usb_c" })
  expect(usb.connectorA).toMatchObject({
    shellWidth: 8.25,
    shellHeight: 2.4,
    shellDepth: 6.5,
  })
  expect(usb.crossSection).toEqual({
    kind: "round_jacket",
    diameter: 4,
    color: "#263449",
  })
  const mains = parseCableString("us_mains")
  expect(mains.crossSection).toMatchObject({
    kind: "round_jacket",
    diameter: 6.2,
  })
  expect(Object.keys(mains)).toEqual([
    "standard",
    "connectorA",
    "connectorB",
    "crossSection",
  ])
})

test("object input configures physical cable cross sections", () => {
  expect(
    getCableDefinition({
      standard: "usb_c",
      jacketDiameter: 5,
      color: "#ffffff",
    }).crossSection,
  ).toEqual({ kind: "round_jacket", diameter: 5, color: "#ffffff" })
  const cable = getCableDefinition({
    standard: "jst_sh",
    pinCount: 6,
    wireDiameter: 0.8,
  })
  expect(cable.crossSection).toMatchObject({
    kind: "wire_bundle",
    wires: Array.from({ length: 6 }, () => ({ diameter: 0.8 })),
  })
})

test("missing JST pin counts use explicit defaults; names ignore surrounding whitespace and case", () => {
  expect(parseCableString("  JST_SH  ")).toEqual(
    parseCableString("jst_sh_pins4"),
  )
  expect(parseCableString("jst_ph")).toEqual(parseCableString("jst_ph_pins2"))
})

test("invalid, unsupported or trailing DSL tokens fail instead of being ignored", () => {
  for (const cableString of [
    "",
    "usb",
    "usb_c_length100",
    "jst_sh_pins0",
    "jst_ph_pins17",
    "jst_sh_pins2.5",
    "jst_ph_pins4_extra",
    "us_mains_pins2",
  ]) {
    expect(() => parseCableString(cableString)).toThrow()
  }
})

test("unusable pin counts, insulation diameters and nonfinite sizes are rejected", () => {
  for (const pinCount of [0, 1, 2.5, 17, NaN, Infinity]) {
    expect(() => getCableDefinition({ standard: "jst_ph", pinCount })).toThrow()
  }
  for (const wireDiameter of [0, 0.3, 0.9, Infinity, NaN]) {
    expect(() =>
      getCableDefinition({ standard: "jst_sh", wireDiameter }),
    ).toThrow()
  }
  for (const jacketDiameter of [0, -2, Infinity, NaN]) {
    expect(() =>
      getCableDefinition({ standard: "usb_c", jacketDiameter }),
    ).toThrow()
  }
})

test("input schema rejects route, length and mesh properties", () => {
  for (const extra of [
    { length: 100 },
    { route: [] },
    { sag: 10 },
    { mesh: {} },
  ]) {
    expect(
      cableInputSchema.safeParse({ standard: "usb_c", ...extra }).success,
    ).toBe(false)
  }
  expect(
    cableInputSchema.safeParse({ standard: "usb_c", pinCount: 4 }).success,
  ).toBe(false)
  expect(
    cableInputSchema.safeParse({ standard: "usb_c", color: 'red"/>' }).success,
  ).toBe(false)
})

test("serialized definitions reject incompatible connectors, wrong conductor counts and overlapping wires", () => {
  const sh = getCableDefinition({ standard: "jst_sh" })
  const usb = getCableDefinition({ standard: "usb_c" })
  expect(
    cableDefinitionSchema.safeParse({ ...sh, connectorB: usb.connectorB })
      .success,
  ).toBe(false)
  if (sh.crossSection.kind !== "wire_bundle")
    throw new Error("Expected a bundle")
  expect(
    cableDefinitionSchema.safeParse({
      ...sh,
      crossSection: {
        ...sh.crossSection,
        wires: sh.crossSection.wires.slice(1),
      },
    }).success,
  ).toBe(false)
  expect(
    cableDefinitionSchema.safeParse({
      ...sh,
      crossSection: { ...sh.crossSection, wirePitch: 0.3 },
    }).success,
  ).toBe(false)
  expect(
    cableDefinitionSchema.safeParse({ ...sh, crossSection: usb.crossSection })
      .success,
  ).toBe(false)
  expect(cableDefinitionSchema.safeParse({ ...usb, route: [] }).success).toBe(
    false,
  )
})

test("cable instances do not share mutable connectors or wire arrays", () => {
  const cable = getCableDefinition({ standard: "jst_sh" })
  cable.connectorA.bodyWidth = 99
  expect(cable.connectorB.bodyWidth).toBe(5)
  const nextCable = getCableDefinition({ standard: "jst_sh" })
  expect(nextCable.connectorA.bodyWidth).toBe(5)
  if (
    cable.crossSection.kind !== "wire_bundle" ||
    nextCable.crossSection.kind !== "wire_bundle"
  )
    throw new Error("Expected bundles")
  cable.crossSection.wires[0]!.diameter = 99
  expect(nextCable.crossSection.wires[0]!.diameter).toBe(0.6)
})
