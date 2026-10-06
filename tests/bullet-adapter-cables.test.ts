import { expect, test } from "bun:test"
import { getCableDefinition, parseCableString } from "../lib"

test("named adapter diameters preserve both mating interfaces and aligned wires", () => {
  for (const pinCount of [1, 3]) {
    for (const genderB of ["male", "female"] as const) {
      const definition = getCableDefinition({
        standard: "bullet",
        diameterA: 3.5,
        diameterB: 4,
        pinCount,
        genderA: "female",
        genderB,
      })
      const prefix = `bullet${pinCount === 1 ? "" : pinCount}`
      for (const text of [
        `${prefix}_da3.5mm_db4mm_afemale_b${genderB}`,
        `${prefix}_b${genderB}_db4mm_afemale_da3.5mm`,
        `${prefix}_d3.5mm_db4mm_afemale_b${genderB}`,
      ])
        expect(parseCableString(text)).toEqual(definition)
      expect(definition.connectorA).toMatchObject({
        kind: "bullet_female",
        diameter: 3.5,
        pitch: 6,
        pinCount,
      })
      expect(definition.connectorB).toMatchObject({
        kind: `bullet_${genderB}`,
        diameter: 4,
        pitch: 6,
        pinCount,
      })
      if (pinCount === 3) {
        expect(definition.crossSection.kind).toBe("wire_bundle")
        if (definition.crossSection.kind !== "wire_bundle")
          throw new Error("Expected three separate wires")
        expect(definition.crossSection.wires).toHaveLength(3)
        expect(definition.crossSection.wirePitch).toBe(6)
      }
    }
  }
  for (const text of [
    "bullet3_da3.5mm",
    "bullet3_db4mm",
    "bullet3_da3.5mm_db7mm",
    "bullet3_da3.5mm_db4mm_da4mm",
    "bullet3_3.5mm_4mm",
  ])
    expect(() => parseCableString(text)).toThrow()
})
