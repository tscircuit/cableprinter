import type { CableConnector, CableDefinition } from "./cable-definition"

/** Canonical stock connector DSL; custom mesh dimensions are not encoded. */
export function stringifyConnector(connector: CableConnector): string {
  switch (connector.kind) {
    case "bullet_male":
    case "bullet_female":
      return `bullet${connector.pinCount === 1 ? "" : connector.pinCount}_d${connector.diameter}mm_g${connector.kind === "bullet_male" ? "male" : "female"}`
    case "jst_sh_housing":
      return `jst_sh_pins${connector.pinCount}`
    case "jst_ph_housing":
      return `jst_ph_pins${connector.pinCount}`
    case "usb_c_plug":
      return "usb_c"
    case "nema_5_15p":
      return "nema_5_15p"
    case "iec_c13":
      return "iec_c13"
  }
}

/** Serialize mating interfaces. Custom cross sections remain object API
 * properties. useShorthand retains existing cable presets where applicable.
 */
export function stringifyCableDefinition(
  definition: CableDefinition,
  { useShorthand = false }: { useShorthand?: boolean } = {},
): string {
  const { connectorA: a, connectorB: b } = definition
  if (definition.standard !== "adaptercable" || useShorthand) {
    if (
      "diameter" in a &&
      "diameter" in b &&
      a.diameter === b.diameter &&
      a.pinCount === b.pinCount
    )
      return `bullet${a.pinCount === 1 ? "" : a.pinCount}_d${a.diameter}mm_a${a.kind === "bullet_male" ? "male" : "female"}_b${b.kind === "bullet_male" ? "male" : "female"}`
    if (
      !("diameter" in a) &&
      a.kind === b.kind &&
      (!("pinCount" in a) || !("pinCount" in b) || a.pinCount === b.pinCount)
    )
      return stringifyConnector(a)
    if (a.kind === "nema_5_15p" && b.kind === "iec_c13") return "us_mains"
  }
  return `adaptercable_a(${stringifyConnector(a)})_b(${stringifyConnector(b)})`
}
