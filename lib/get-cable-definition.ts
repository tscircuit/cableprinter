import { getBulletConnector } from "./bullet-connector"
import { type CableDefinition, cableDefinitionSchema } from "./cable-definition"
import { type CableInput, cableInputSchema } from "./cable-input"

const wireColors = [
  "#df4049",
  "#263449",
  "#e1b13c",
  "#347dc9",
  "#27a782",
  "#af62bd",
]

export function getCableDefinition(cableInput: CableInput): CableDefinition {
  const cable = cableInputSchema.parse(cableInput)
  if (cable.standard === "bullet") {
    return cableDefinitionSchema.parse({
      standard: "bullet",
      connectorA: getBulletConnector({
        diameter: cable.diameter,
        gender: cable.genderA,
        pinCount: cable.pinCount,
      }),
      connectorB: getBulletConnector({
        diameter: cable.diameter,
        gender: cable.genderB,
        pinCount: cable.pinCount,
      }),
      crossSection:
        cable.pinCount === 1
          ? {
              kind: "round_jacket",
              diameter: cable.wireDiameter,
              color: cable.color,
            }
          : {
              kind: "wire_bundle",
              wirePitch: cable.diameter + 2,
              wires: Array.from({ length: cable.pinCount }, (_, index) => ({
                diameter: cable.wireDiameter,
                color: wireColors[index % wireColors.length],
              })),
            },
    })
  }
  if (cable.standard === "usb_c") {
    const connector = {
      kind: "usb_c_plug" as const,
      bodyWidth: 12,
      bodyHeight: 6,
      bodyDepth: 18,
      shellWidth: 8.25,
      shellHeight: 2.4,
      shellDepth: 6.5,
    }
    return cableDefinitionSchema.parse({
      standard: cable.standard,
      connectorA: connector,
      connectorB: { ...connector },
      crossSection: {
        kind: "round_jacket",
        diameter: cable.jacketDiameter,
        color: cable.color,
      },
    })
  }
  if (cable.standard === "us_mains") {
    return cableDefinitionSchema.parse({
      standard: cable.standard,
      connectorA: {
        kind: "nema_5_15p",
        bodyWidth: 32,
        bodyHeight: 28,
        bodyDepth: 35,
      },
      connectorB: {
        kind: "iec_c13",
        bodyWidth: 24,
        bodyHeight: 18,
        bodyDepth: 30,
      },
      crossSection: {
        kind: "round_jacket",
        diameter: cable.jacketDiameter,
        color: cable.color,
      },
    })
  }
  const isSh = cable.standard === "jst_sh"
  const connector = {
    kind: isSh ? ("jst_sh_housing" as const) : ("jst_ph_housing" as const),
    pinCount: cable.pinCount,
    pitch: isSh ? (1 as const) : (2 as const),
    bodyWidth: isSh ? cable.pinCount + 1 : (cable.pinCount - 1) * 2 + 3.8,
    bodyHeight: isSh ? 2.8 : 4.5,
    bodyDepth: isSh ? 5 : 6.85,
  }
  return cableDefinitionSchema.parse({
    standard: cable.standard,
    connectorA: connector,
    connectorB: { ...connector },
    crossSection: {
      kind: "wire_bundle",
      wirePitch: connector.pitch,
      wires: Array.from({ length: cable.pinCount }, (_, index) => ({
        diameter: cable.wireDiameter,
        color: wireColors[index % wireColors.length],
      })),
    },
  })
}
