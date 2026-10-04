import {
  createCableMeshes,
  type CablePoint,
  type CableMesh,
} from "jscad-electronics/cables"
import type { CableDefinition } from "../lib"

/** Resolved fixture centerline, independent of the physical cable definition. */
export function previewCablePath({
  span = 90,
  dip = 18,
}: {
  span?: number
  dip?: number
} = {}): CablePoint[] {
  return Array.from({ length: 73 }, (_, index) => {
    const t = index / 72
    const u = 1 - t
    return [
      span *
        (-0.5 * u ** 3 -
          0.5 * 3 * u ** 2 * t +
          0.5 * 3 * u * t ** 2 +
          0.5 * t ** 3),
      65 * 3 * u * t,
      -dip * 3 * u * t,
    ]
  })
}

export function previewCableMeshes(definition: CableDefinition): CableMesh[] {
  return createCableMeshes({
    definition,
    path: previewCablePath(),
    radialSegments: 32,
  })
}

export function previewConnectorMeshes({
  definition,
  end = "A",
}: {
  definition: CableDefinition
  end?: "A" | "B"
}): CableMesh[] {
  // A straight fixture isolates the selected connector in its local frame.
  const connector = end === "A" ? definition.connectorA : definition.connectorB
  return createCableMeshes({
    definition: { ...definition, connectorA: connector, connectorB: connector },
    path: [
      [0, 0, 0],
      [0, 0, 35],
    ],
  }).filter((mesh) => mesh.name.startsWith("A-"))
}
