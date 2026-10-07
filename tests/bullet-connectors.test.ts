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
          parseCableString(`bullet_d${diameter}mm_a${genderA}_b${genderB}`),
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
    expect(parseCableString(`bullet_d${diameter}mm`)).toEqual(
      getCableDefinition({ standard: "bullet", diameter }),
    )
  }
})

test("named bullet parameters are order-independent and end genders default independently", () => {
  const expected = getCableDefinition({
    standard: "bullet",
    diameter: 3.5,
    pinCount: 3,
    genderA: "female",
    genderB: "male",
  })
  for (const text of [
    "bullet3_d3.5mm_afemale_bmale",
    "bullet3_bmale_d3.5mm_afemale",
    "bullet3_afemale_bmale_d3.5mm",
  ])
    expect(parseCableString(text)).toEqual(expected)
  expect(parseCableString("bullet_d3.5mm_afemale")).toEqual(
    getCableDefinition({
      standard: "bullet",
      diameter: 3.5,
      genderA: "female",
    }),
  )
  expect(parseCableString("bullet_bmale_d3.5mm")).toEqual(
    getCableDefinition({ standard: "bullet", diameter: 3.5, genderB: "male" }),
  )
})

test("positional, duplicate, unknown and invalid parameters fail", () => {
  for (const text of [
    "bullet3_3.5mm",
    "bullet_3.5mm_male_female",
    "bullet3_d3.5mm_male_female",
    "bullet3_afemale_bmale",
    "bullet_d3.5mm_d4mm",
    "bullet_d3.5mm_amale_afemale",
    "bullet_d3.5mm_bmale_bfemale",
    "bullet_d3.5mm_asocket",
    "bullet_d3.5mm_extra",
    "bullet",
    "bullet_d0mm",
    "bullet_d7mm",
    "bullet_d3.5mm_male",
    "bullet_d4mm_male_socket",
    "bullet_d4mm_amale_bfemale_extra",
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
  const usb = getCableDefinition({ standard: "usb_c" })
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
