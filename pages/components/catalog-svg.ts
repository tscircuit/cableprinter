import { cableExamples, type CableExample } from "../cable-examples"
import { cableIllustrationSvg } from "./cable-illustration"
import { connectorFaceSvg } from "./connector-illustration"
import { svgDocument, svgText } from "./svg-helpers"

function cableCardSvg({
  example,
  y,
}: {
  example: CableExample
  y: number
}): string {
  const { cable } = example
  const connector = cable.connectorA
  const faceWidth = Math.max(connector.bodyWidth + 5, 12)
  const faceHeight = Math.max(connector.bodyHeight + 3, 7)
  return `<g transform="translate(24 ${y})">
    <rect width="1312" height="360" rx="16" fill="#fff"/>
    ${svgText({ text: example.title, x: 24, y: 35, size: 23, fill: "#14253b" })}
    ${svgText({ text: example.subtitle, x: 24, y: 62, size: 15 })}
    <rect x="20" y="86" width="344" height="225" rx="10" fill="#f2f5f8"/>
    ${example.code.map((line, index) => svgText({ text: line, x: 35, y: 118 + index * 24, size: 15, fill: "#223c59" })).join("")}
    ${svgText({ text: "CABLE ASSEMBLY", x: 392, y: 104, size: 12 })}
    <svg x="375" y="110" width="640" height="208" viewBox="0 0 190 100">${cableIllustrationSvg(cable)}</svg>
    <path d="M1015 91 V300" stroke="#e4eaf0"/>
    ${svgText({ text: "MATING FACE", x: 1040, y: 104, size: 12 })}
    ${cable.standard === "us_mains" ? `<svg x="1038" y="140" width="115" height="100" viewBox="-18.5 -15.5 37 31">${connectorFaceSvg(connector)}</svg><svg x="1168" y="140" width="115" height="100" viewBox="-12 -8 24 16">${connectorFaceSvg(cable.connectorB)}</svg>` : `<svg x="1038" y="140" width="245" height="100" viewBox="${-faceWidth / 2} ${-faceHeight / 2} ${faceWidth} ${faceHeight}">${connectorFaceSvg(connector)}</svg>`}
    ${svgText({ text: "pinCount" in connector ? `${connector.pinCount} contacts / ${connector.pitch} mm pitch` : connector.kind === "usb_c_plug" ? "8.25 x 2.4 mm shell" : "NEMA 5-15P / IEC C13", x: 1040, y: 265, size: 13 })}
    ${svgText({ text: "detail enlarged", x: 1040, y: 287, size: 12 })}
    ${svgText({ text: example.annotation, x: 24, y: 339, size: 15 })}
  </g>`
}

export function catalogSvg(): string {
  return svgDocument({
    width: 1360,
    height: 1670,
    content: [
      svgText({
        text: "cableprinter / common cable definitions",
        x: 28,
        y: 48,
        size: 28,
        fill: "#14253b",
      }),
      svgText({
        text: "Definition code at left / cable silhouette and connector detail at right",
        x: 28,
        y: 80,
        size: 16,
      }),
      ...cableExamples.map((example, index) =>
        cableCardSvg({ example, y: 110 + index * 380 }),
      ),
      svgText({
        text: "Illustrative presentation curves; definitions contain no length, route, sag or mesh.",
        x: 28,
        y: 1648,
        size: 14,
      }),
    ].join(""),
  })
}

export function singleCableSvg(example: CableExample): string {
  return svgDocument({
    width: 1360,
    height: 408,
    content: cableCardSvg({ example, y: 24 }),
  })
}
