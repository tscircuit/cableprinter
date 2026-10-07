import { expect, test } from "bun:test"
import {
  cableInputSchema,
  cableDefinitionSchema,
  getAdapterCableDefinition,
  getCableDefinition,
  parseCableString,
  parseConnectorString,
  stringifyCableDefinition,
  stringifyConnector,
} from "../lib"

test("adaptercable composes independently named mating interfaces", () => {
  for (const pinCount of [1, 3])
    for (const genderB of ["male", "female"] as const) {
      const prefix = `bullet${pinCount === 1 ? "" : pinCount}`
      const a = `${prefix}_d3.5mm_gfemale`
      const b = `${prefix}_d4mm_g${genderB}`
      const connectorA = parseConnectorString(a)
      const connectorB = parseConnectorString(b)
      const definition = getAdapterCableDefinition({ connectorA, connectorB })
      const text = `adaptercable_a(${a})_b(${b})`
      expect(parseCableString(text)).toEqual(definition)
      expect(parseCableString(`adaptercable_b(${b})_a(${a})`)).toEqual(
        definition,
      )
      expect(
        getCableDefinition({
          standard: "adaptercable",
          connectorA,
          connectorB,
        }),
      ).toEqual(definition)
      expect(stringifyCableDefinition(definition)).toBe(text)
      expect(stringifyCableDefinition(definition, { useShorthand: true })).toBe(
        text,
      )
      expect(definition.connectorA).toMatchObject({
        diameter: 3.5,
        pitch: 5.5,
        pinCount,
        kind: "bullet_female",
      })
      expect(definition.connectorB).toMatchObject({
        diameter: 4,
        pitch: 6,
        pinCount,
        kind: `bullet_${genderB}`,
      })
      expect(stringifyConnector(connectorA)).toBe(a)
      if (pinCount === 3) {
        expect(definition.crossSection).toMatchObject({
          kind: "wire_bundle",
          wirePitch: 6,
        })
        if (definition.crossSection.kind !== "wire_bundle")
          throw new Error("Expected three insulated wires")
        expect(definition.crossSection.wires).toHaveLength(3)
      }
    }
})

test("mixed connector families compose through the same generic API", () => {
  for (const [a, b, count] of [
    ["bullet3_d3.5mm_gfemale", "jst_ph_pins3", 3],
    ["jst_sh_pins4", "jst_ph_pins4", 4],
  ] as const) {
    for (const [endA, endB] of [
      [a, b],
      [b, a],
    ]) {
      const text = `adaptercable_a(${endA})_b(${endB})`
      const definition = parseCableString(text)
      expect(definition.standard).toBe("adaptercable")
      expect(definition.connectorA).toEqual(parseConnectorString(endA!))
      expect(definition.connectorB).toEqual(parseConnectorString(endB!))
      expect(stringifyCableDefinition(definition)).toBe(text)
      if (definition.crossSection.kind !== "wire_bundle")
        throw new Error("Expected wire bundle")
      expect(definition.crossSection.wires).toHaveLength(count)
      expect(cableDefinitionSchema.parse(definition)).toEqual(definition)
    }
  }
  expect(
    parseCableString("adaptercable_a(nema_5_15p)_b(iec_c13)").connectorB.kind,
  ).toBe("iec_c13")
  expect(
    parseCableString("adaptercable_a(usb_c)_b(usb_c)").crossSection.kind,
  ).toBe("round_jacket")
  const same = parseCableString(
    "adaptercable_a(bullet3_d3.5mm_gfemale)_b(bullet3_d3.5mm_gmale)",
  )
  const shorthand = stringifyCableDefinition(same, { useShorthand: true })
  expect(shorthand).toBe("bullet3_d3.5mm_afemale_bmale")
  expect(parseCableString(shorthand).connectorA).toEqual(same.connectorA)
})

test("ambiguous ends, old diameter modifiers, malformed composition and incompatible counts fail", () => {
  for (const text of [
    "bullet3_da3.5mm_db4mm_afemale_bfemale",
    "bullet3_d3.5mm_db4mm",
    "adaptercable_a(bullet3_d3.5mm_gfemale)",
    "adaptercable_a(jst_ph_pins3)_a(jst_sh_pins3)",
    "adaptercable_(jst_ph_pins3)_(jst_sh_pins3)",
    "adaptercable_a(jst_ph_pins3)_b(jst_sh_pins4)",
    "adaptercable_a(bullet3_d3.5mm_gfemale)_b(bullet_d4mm_gfemale)",
    "adaptercable_a(bullet3_d3.5mm_afemale)_b(bullet3_d4mm_gfemale)",
    "adaptercable_a(bullet3_d3.5mm)_b(bullet3_d4mm_gfemale)",
    "adaptercable_a(bullet3_d3.5mm_gfemale_gmale)_b(bullet3_d4mm_gfemale)",
    "adaptercable_a(bullet3_d3.5mm_gfemale)_b(bullet3_d7mm_gfemale)",
    "adaptercable_a(jst_ph_pins3)_b(jst_sh_pins3)_length100mm",
    "adaptercable_a(jst_ph_pins3)_b(jst_sh_pins3)_b(jst_sh_pins3)",
    "adaptercable_a(adaptercable_a(usb_c)_b(usb_c))_b(usb_c)",
    "adaptercable_a()_b(usb_c)",
    "adaptercable_a(usb_c_b(usb_c)",
  ])
    expect(() => parseCableString(text)).toThrow()
  expect(
    cableInputSchema.safeParse({
      standard: "bullet",
      diameterA: 3.5,
      diameterB: 4,
    }).success,
  ).toBe(false)
  const connectorA = parseConnectorString("bullet3_d3.5mm_gfemale")
  const connectorB = parseConnectorString("jst_ph_pins3")
  expect(() =>
    getAdapterCableDefinition({
      connectorA,
      connectorB,
      crossSection: {
        kind: "wire_bundle",
        wirePitch: 6,
        wires: Array.from({ length: 3 }, () => ({
          diameter: 3,
          color: "#263449",
        })),
      },
    }),
  ).toThrow()
})
