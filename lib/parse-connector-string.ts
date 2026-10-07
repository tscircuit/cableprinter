import { bulletDiameterSchema } from "./bullet-connector"
import type { CableConnector } from "./cable-definition"
import { getCableDefinition } from "./get-cable-definition"

/** Parse one mating interface, not a cable with two ends. */
export function parseConnectorString(connectorString: string): CableConnector {
  const name = connectorString.trim().toLowerCase()
  const bullet = /^bullet([1-9][0-9]*)?_(.+)$/.exec(name)
  if (bullet) {
    let diameter: number | undefined
    let gender: "male" | "female" | undefined
    const seen = new Set<string>()
    for (const parameter of bullet[2]!.split("_")) {
      const match =
        /^d([0-9]+(?:\.[0-9]+)?)mm$/.exec(parameter) ??
        /^g(male|female)$/.exec(parameter)
      const key = parameter[0]!
      if (!match || seen.has(key))
        throw new Error(
          `Invalid or duplicate connector parameter: "${parameter}"`,
        )
      seen.add(key)
      if (key === "d") diameter = Number(match[1])
      else gender = match[1] as "male" | "female"
    }
    if (diameter === undefined || gender === undefined)
      throw new Error(
        "Bullet connector strings require dNmm and gmale or gfemale",
      )
    return getCableDefinition({
      standard: "bullet",
      diameter: bulletDiameterSchema.parse(diameter),
      pinCount: bullet[1] ? Number(bullet[1]) : 1,
      genderA: gender,
    }).connectorA
  }
  const jst = /^(jst_sh|jst_ph)(?:_pins([0-9]+))?$/.exec(name)
  if (jst)
    return getCableDefinition({
      standard: jst[1] as "jst_sh" | "jst_ph",
      ...(jst[2] ? { pinCount: Number(jst[2]) } : {}),
    }).connectorA
  if (name === "usb_c")
    return getCableDefinition({ standard: "usb_c" }).connectorA
  if (name === "nema_5_15p")
    return getCableDefinition({ standard: "us_mains" }).connectorA
  if (name === "iec_c13")
    return getCableDefinition({ standard: "us_mains" }).connectorB
  throw new Error(`Unsupported connector string: "${connectorString}"`)
}
