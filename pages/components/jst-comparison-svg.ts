import { getCableDefinition } from "../../lib"
import { connectorFaceSvg, connectorSideSvg } from "./connector-illustration"
import { svgDocument, svgText } from "./svg-helpers"

export function jstComparisonSvg(): string {
  const rows = (["jst_sh", "jst_ph"] as const).map((standard, row) => {
    const y = 130 + row * 350
    return [2, 4, 6]
      .map((pinCount, column) => {
        const cable = getCableDefinition({ standard, pinCount })
        const connector = cable.connectorA
        const x = 24 + column * 408
        return `<g transform="translate(${x} ${y})">
        <rect width="388" height="328" rx="14" fill="#fff"/>
        ${svgText({ text: `${standard === "jst_sh" ? "SH / 1 mm" : "PH / 2 mm"} / ${pinCount} pins`, x: 20, y: 34, size: 20, fill: "#14253b" })}
        ${svgText({ text: `"${standard}_pins${pinCount}"`, x: 20, y: 63, size: 15 })}
        <g transform="translate(194 132) scale(16)">${connectorFaceSvg(connector)}</g>
        <g transform="translate(194 264) rotate(-90) scale(9)">${connectorSideSvg(connector)}</g>
        ${svgText({ text: `${connector.bodyWidth} x ${connector.bodyHeight} x ${connector.bodyDepth} mm`, x: 20, y: 294, size: 15 })}
      </g>`
      })
      .join("")
  })
  return svgDocument({
    width: 1252,
    height: 874,
    content: [
      svgText({
        text: "JST / pin count and pitch comparison",
        x: 28,
        y: 46,
        size: 27,
        fill: "#14253b",
      }),
      svgText({
        text: "Mating faces share one scale. White housings / aligned contact centers.",
        x: 28,
        y: 78,
        size: 15,
      }),
      ...rows,
      svgText({
        text: "Body dimensions: width x height x depth. SH without side protrusions; PH PHR housings.",
        x: 28,
        y: 847,
        size: 14,
      }),
    ].join(""),
  })
}
