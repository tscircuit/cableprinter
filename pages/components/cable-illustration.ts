import type { CableDefinition } from "../../lib"
import { connectorSideSvg } from "./connector-illustration"

/** Authored presentation curve. Routing and sagging solvers are separate work. */
export function cableIllustrationSvg(cable: CableDefinition): string {
  const wireExitA = cable.connectorA.bodyDepth
  const wireExitB = 115 - cable.connectorB.bodyDepth
  const crossSection = cable.crossSection
  const wires =
    crossSection.kind === "wire_bundle"
      ? crossSection.wires.map((wire, index) => ({
          ...wire,
          offset:
            (index - (crossSection.wires.length - 1) / 2) *
            crossSection.wirePitch,
        }))
      : [
          {
            diameter: crossSection.diameter,
            color: crossSection.color,
            offset: 0,
          },
        ]
  return `<g transform="translate(36 30)">
    ${wires
      .map(
        (
          wire,
        ) => `<path d="M${wireExitA},${wire.offset} C${wireExitA + 28},${wire.offset} 28,${42 + wire.offset} 58,${42 + wire.offset} S${wireExitB - 24},${wire.offset} ${wireExitB},${wire.offset}" fill="none" stroke="#17273b" stroke-opacity=".15" stroke-width="${wire.diameter + 0.45}" stroke-linecap="round"/>
      <path d="M${wireExitA},${wire.offset} C${wireExitA + 28},${wire.offset} 28,${42 + wire.offset} 58,${42 + wire.offset} S${wireExitB - 24},${wire.offset} ${wireExitB},${wire.offset}" fill="none" stroke="${wire.color}" stroke-width="${wire.diameter}" stroke-linecap="round"/>`,
      )
      .join("")}
    ${connectorSideSvg(cable.connectorA)}
    <g transform="translate(115 0) scale(-1 1)">${connectorSideSvg(cable.connectorB)}</g>
  </g>`
}
