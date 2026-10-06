import { expect, test } from "bun:test"
import {
  cableDefinitionSchema,
  cableInputSchema,
  getCableDefinition,
  parseCableString,
} from "../lib"

test("bullet sizes and independent end genders survive DSL and object input", () => {
  for (const diameter of [2, 3, 3.5, 4, 5, 5.5, 6, 8] as const) {
    for (const genderA of ["male", "female"] as const) {
      for (const genderB of ["male", "female"] as const) {
        const definition = getCableDefinition({
          standard: "bullet",
          diameter,
          genderA,
          genderB,
        })
        expect(
          parseCableString(`bullet_${diameter}mm_${genderA}_${genderB}`),
        ).toEqual(definition)
        expect(definition.connectorA.kind).toBe(`bullet_${genderA}`)
        expect(definition.connectorB.kind).toBe(`bullet_${genderB}`)
        expect(definition.crossSection).toEqual({
          kind: "round_jacket",
          diameter: 2,
          color: "#263449",
        })
      }
    }
    expect(parseCableString(`bullet_${diameter}mm`)).toEqual(
      getCableDefinition({ standard: "bullet", diameter }),
    )
  }
})

test("invalid sizes, incomplete genders and incompatible physical definitions fail", () => {
  for (const text of [
    "bullet",
    "bullet_0mm",
    "bullet_7mm",
    "bullet_3.5mm_male",
    "bullet_4mm_male_socket",
    "bullet_4mm_male_female_extra",
  ]) {
    expect(() => parseCableString(text)).toThrow()
  }
  expect(cableInputSchema.safeParse({ standard: "bullet" }).success).toBe(false)
  for (const diameter of [0, -1, 7, NaN, Infinity]) {
    expect(
      cableInputSchema.safeParse({ standard: "bullet", diameter }).success,
    ).toBe(false)
  }
  const definition = getCableDefinition({ standard: "bullet", diameter: 4 })
  const other = getCableDefinition({ standard: "bullet", diameter: 3.5 })
  const usb = getCableDefinition({ standard: "usb_c" })
  expect(
    cableDefinitionSchema.safeParse({
      ...definition,
      connectorB: other.connectorB,
    }).success,
  ).toBe(false)
  expect(
    cableDefinitionSchema.safeParse({
      ...definition,
      connectorB: usb.connectorB,
    }).success,
  ).toBe(false)
  expect(() =>
    getCableDefinition({ standard: "bullet", diameter: 2, wireDiameter: 5 }),
  ).toThrow()
  expect(
    cableDefinitionSchema.safeParse({
      ...definition,
      connectorA: { ...definition.connectorA, contactDepth: 100 },
    }).success,
  ).toBe(false)
})
