import { parseCableString } from "../lib"

export const cableExamples = [
  {
    cableString: "usb_c",
    title: "USB-C to USB-C",
    subtitle: "Reversible plugs / round jacket",
    annotation: "8.25 x 2.4 mm plug shell / representative overmold",
    code: [
      'parseCableString("usb_c")',
      "",
      "// Object form",
      "getCableDefinition({",
      '  standard: "usb_c",',
      "  jacketDiameter: 4,",
      "})",
    ],
  },
  {
    cableString: "jst_sh_pins4",
    title: "JST SH / 1 mm pitch",
    subtitle: "4-position housing / four insulated wires",
    annotation: "SHR-04V-S-B: 5 x 2.8 x 5 mm / 0.6 mm wire O.D.",
    code: [
      'parseCableString("jst_sh_pins4")',
      "",
      "getCableDefinition({",
      '  standard: "jst_sh",',
      "  pinCount: 4,",
      "  wireDiameter: 0.6,",
      "})",
    ],
  },
  {
    cableString: "jst_ph_pins2",
    title: "JST PH / 2 mm pitch",
    subtitle: "2-position housing / two insulated wires",
    annotation: "PHR-2: 5.8 x 4.5 x 6.85 mm / 1.2 mm wire O.D.",
    code: [
      'parseCableString("jst_ph_pins2")',
      "",
      "getCableDefinition({",
      '  standard: "jst_ph",',
      "  pinCount: 2,",
      "  wireDiameter: 1.2,",
      "})",
    ],
  },
  {
    cableString: "us_mains",
    title: "US wall power / grounded",
    subtitle: "NEMA 5-15P plug to IEC C13 appliance connector",
    annotation: "6.2 mm jacket / representative molded bodies",
    code: [
      'parseCableString("us_mains")',
      "",
      "getCableDefinition({",
      '  standard: "us_mains",',
      "  jacketDiameter: 6.2,",
      "})",
    ],
  },
].map((example) => ({
  ...example,
  cable: parseCableString(example.cableString),
}))

export type CableExample = (typeof cableExamples)[number]
