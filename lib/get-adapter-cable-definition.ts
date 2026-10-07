import { cableDefinitionSchema, type CableDefinition } from "./cable-definition"
import { adapterCableInputSchema, type AdapterCableInput } from "./cable-input"

const wireColors = [
  "#df4049",
  "#263449",
  "#e1b13c",
  "#347dc9",
  "#27a782",
  "#af62bd",
]

/** Compose independent mating interfaces. Dimensions are connector-local mm;
 * this describes the cable, never its world placement or route.
 */
export function getAdapterCableDefinition(
  input: Omit<AdapterCableInput, "standard">,
): CableDefinition {
  const cable = adapterCableInputSchema.parse({
    standard: "adaptercable",
    ...input,
  })
  const { connectorA, connectorB } = cable
  const bundled =
    "pinCount" in connectorA &&
    "pinCount" in connectorB &&
    connectorA.pinCount > 1
  const pitches = [connectorA, connectorB].flatMap((connector) =>
    "pitch" in connector ? [connector.pitch] : [],
  )
  const wireDiameter = Math.min(2, ...pitches.map((pitch) => pitch * 0.6))
  return cableDefinitionSchema.parse({
    ...cable,
    crossSection:
      cable.crossSection ??
      (bundled
        ? {
            kind: "wire_bundle",
            wirePitch: Math.max(...pitches),
            wires: Array.from({ length: connectorA.pinCount }, (_, index) => ({
              diameter: wireDiameter,
              color: wireColors[index % wireColors.length],
            })),
          }
        : {
            kind: "round_jacket",
            diameter: Math.min(
              4,
              connectorA.bodyHeight,
              connectorB.bodyHeight,
              ...pitches.map((pitch) => Math.min(2, pitch * 0.6)),
            ),
            color: "#263449",
          }),
  })
}
