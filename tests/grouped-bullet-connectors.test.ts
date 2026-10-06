import { expect, test } from "bun:test"
import {
  cableDefinitionSchema,
  getCableDefinition,
  parseCableString,
} from "../lib"

test("grouped bullet DSL describes one separate contact and insulated wire per circuit", () => {
  for (const diameter of [2, 3, 3.5, 4, 5, 5.5, 6, 8] as const) {
    for (const pinCount of [2, 3, 6, 16]) {
      for (const genderA of ["male", "female"] as const) {
        for (const genderB of ["male", "female"] as const) {
          const definition = getCableDefinition({
            standard: "bullet",
            diameter,
            pinCount,
            genderA,
            genderB,
          })
          expect(
            parseCableString(
              `bullet${pinCount}_d${diameter}mm_a${genderA}_b${genderB}`,
            ),
          ).toEqual(definition)
          expect(definition.connectorA).toMatchObject({
            kind: `bullet_${genderA}`,
            pinCount,
            pitch: diameter + 2,
          })
          expect(definition.crossSection.kind).toBe("wire_bundle")
          if (definition.crossSection.kind !== "wire_bundle")
            throw new Error("Expected insulated wire bundle")
          expect(definition.crossSection.wires).toHaveLength(pinCount)
          expect(definition.crossSection.wirePitch).toBe(diameter + 2)
          expect(
            definition.crossSection.wires.every((wire) => wire.diameter === 2),
          ).toBe(true)
        }
      }
    }
  }
  const triple = parseCableString("bullet3_d3.5mm")
  expect(triple).toEqual(
    getCableDefinition({ standard: "bullet", diameter: 3.5, pinCount: 3 }),
  )
  expect(parseCableString("bullet1_d3.5mm")).toEqual(
    parseCableString("bullet_d3.5mm"),
  )
  for (const text of [
    "bullet0_d3.5mm",
    "bullet17_d3.5mm",
    "bullet03_d3.5mm",
    "bullet3_d3.5mm_male",
    "bullet3_d7mm",
  ]) {
    expect(() => parseCableString(text)).toThrow()
  }
  const single = parseCableString("bullet_d3.5mm")
  expect(
    cableDefinitionSchema.safeParse({
      ...triple,
      connectorB: single.connectorB,
    }).success,
  ).toBe(false)
  expect(
    cableDefinitionSchema.safeParse({
      ...triple,
      crossSection: single.crossSection,
    }).success,
  ).toBe(false)
  if (triple.crossSection.kind !== "wire_bundle")
    throw new Error("Expected wire bundle")
  expect(
    cableDefinitionSchema.safeParse({
      ...triple,
      crossSection: { ...triple.crossSection, wirePitch: 2 },
    }).success,
  ).toBe(false)
})
