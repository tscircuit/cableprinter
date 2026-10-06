import { parseCableString } from "../lib"

export const bulletCableExamples = [
  {
    cableString: "bullet3_d3.5mm",
    title: "Bullet group / three 3.5 mm contacts",
    subtitle: "Three separate male/female pairs / three insulated wires",
    annotation: "5.5 mm contact pitch / three electrical circuits",
    code: [
      'parseCableString("bullet3_d3.5mm_amale_bfemale")',
      "",
      "getCableDefinition({",
      '  standard: "bullet",',
      "  diameter: 3.5,",
      "  pinCount: 3,",
      '  genderA: "male",',
      '  genderB: "female",',
      "})",
    ],
  },
  ...[2, 3, 3.5, 4, 5, 5.5, 6, 8].map((diameter) => ({
    cableString: `bullet_d${diameter}mm`,
    title: `Bullet / ${diameter} mm`,
    subtitle: "Gold solder bullet / male to female / single insulated wire",
    annotation:
      "Representative geometry; nominal mating diameter differs from socket outer diameter",
    code: [
      `parseCableString("bullet_d${diameter}mm_amale_bfemale")`,
      "",
      "getCableDefinition({",
      '  standard: "bullet",',
      `  diameter: ${diameter},`,
      '  genderA: "male",',
      '  genderB: "female",',
      "})",
    ],
  })),
].map((example) => ({
  ...example,
  cable: parseCableString(example.cableString),
}))
