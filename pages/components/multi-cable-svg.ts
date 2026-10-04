import { parseCableString } from "../../lib"
import { cableIllustrationSvg } from "./cable-illustration"
import { connectorFaceSvg } from "./connector-illustration"
import { svgDocument, svgText } from "./svg-helpers"

export function multiCableSvg(): string {
  const motor = parseCableString("jst_ph_pins4")
  const usb = parseCableString("usb_c")
  const mains = parseCableString("us_mains")
  const code = [
    "const cables = [",
    '  parseCableString("usb_c"),',
    '  parseCableString("jst_ph_pins4"),',
    '  parseCableString("us_mains"),',
    "]",
    "",
    "// Independent cable definitions",
    "// Placement and routing are supplied",
    "// by the assembly layer.",
  ]
  return svgDocument({
    width: 1360,
    height: 880,
    content: [
      svgText({
        text: "Several cables / one device",
        x: 28,
        y: 48,
        size: 28,
        fill: "#14253b",
      }),
      svgText({
        text: "USB-C host cable + 4-wire motor cable + grounded appliance cord",
        x: 28,
        y: 80,
        size: 16,
      }),
      '<rect x="24" y="112" width="1312" height="700" rx="16" fill="#fff"/>',
      '<rect x="44" y="142" width="420" height="270" rx="10" fill="#f2f5f8"/>',
      ...code.map((line, index) =>
        svgText({
          text: line,
          x: 60,
          y: 177 + index * 25,
          size: 16,
          fill: "#223c59",
        }),
      ),
      svgText({
        text: "CONTROLLER",
        x: 615,
        y: 150,
        size: 18,
        fill: "#14253b",
      }),
      '<rect x="568" y="173" width="280" height="148" rx="12" fill="#ecf7f1" stroke="#91baab"/>',
      svgText({ text: "4 wires", x: 895, y: 270, size: 16 }),
      '<rect x="1030" y="198" width="224" height="100" rx="10" fill="#edf1f6" stroke="#99aabd"/>',
      '<svg x="538" y="195" width="730" height="270" viewBox="0 0 190 100">' +
        cableIllustrationSvg(motor) +
        "</svg>",
      svgText({ text: "MOTOR", x: 1090, y: 185, size: 18, fill: "#14253b" }),

      '<g transform="translate(1177 225) scale(4)">' +
        connectorFaceSvg(motor.connectorB) +
        "</g>",
      '<svg x="535" y="370" width="730" height="240" viewBox="0 0 190 100">' +
        cableIllustrationSvg(usb) +
        "</svg>",
      svgText({ text: "USB-C / HOST", x: 580, y: 414, size: 17 }),
      '<svg x="535" y="590" width="730" height="200" viewBox="0 0 190 100">' +
        cableIllustrationSvg(mains) +
        "</svg>",
      svgText({ text: "NEMA 5-15P", x: 580, y: 605, size: 17 }),
      svgText({ text: "IEC C13 / POWER SUPPLY", x: 935, y: 605, size: 17 }),
      svgText({
        text: "Authored illustration of three separate cables; no shared conductor bundle or inferred route.",
        x: 28,
        y: 846,
        size: 14,
      }),
    ].join(""),
  })
}
