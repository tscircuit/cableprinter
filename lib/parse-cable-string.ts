import { bulletDiameterSchema } from "./bullet-connector"
import type { CableDefinition } from "./cable-definition"
import { getAdapterCableDefinition } from "./get-adapter-cable-definition"
import { getCableDefinition } from "./get-cable-definition"
import { parseConnectorString } from "./parse-connector-string"

/** Named cable presets, or adaptercable_a(CONNECTOR)_b(CONNECTOR). */
export function parseCableString(cableString: string): CableDefinition {
  const cableName = cableString.trim().toLowerCase()
  if (cableName.startsWith("adaptercable")) {
    const adapter = /^adaptercable_(a|b)\(([^()]+)\)_(a|b)\(([^()]+)\)$/.exec(
      cableName,
    )
    if (!adapter || adapter[1] === adapter[3])
      throw new Error(
        "Adapter cables require exactly one named a(CONNECTOR) and b(CONNECTOR)",
      )
    const first = parseConnectorString(adapter[2]!)
    const second = parseConnectorString(adapter[4]!)
    return getAdapterCableDefinition({
      connectorA: adapter[1] === "a" ? first : second,
      connectorB: adapter[1] === "b" ? first : second,
    })
  }
  if (cableName === "usb_c" || cableName === "us_mains")
    return getCableDefinition({ standard: cableName })
  const bulletMatch = /^bullet([1-9][0-9]*)?_(.+)$/.exec(cableName)
  if (bulletMatch) {
    let diameter: number | undefined
    let genderA: "male" | "female" | undefined
    let genderB: "male" | "female" | undefined
    const seen = new Set<string>()
    for (const parameter of bulletMatch[2]!.split("_")) {
      const match =
        /^d([0-9]+(?:\.[0-9]+)?)mm$/.exec(parameter) ??
        /^(a|b)(male|female)$/.exec(parameter)
      const key = parameter[0]!
      if (!match || seen.has(key))
        throw new Error(`Invalid or duplicate bullet parameter: "${parameter}"`)
      seen.add(key)
      if (key === "d") diameter = Number(match[1])
      else if (key === "a") genderA = match[2] as "male" | "female"
      else genderB = match[2] as "male" | "female"
    }
    if (diameter === undefined) throw new Error("Bullet cables require dNmm")
    return getCableDefinition({
      standard: "bullet",
      diameter: bulletDiameterSchema.parse(diameter),
      pinCount: bulletMatch[1] ? Number(bulletMatch[1]) : 1,
      genderA: genderA ?? "male",
      genderB: genderB ?? "female",
    })
  }
  const jstMatch = /^(jst_sh|jst_ph)(?:_pins([0-9]+))?$/.exec(cableName)
  if (jstMatch)
    return getCableDefinition({
      standard: jstMatch[1] as "jst_sh" | "jst_ph",
      ...(jstMatch[2] ? { pinCount: Number(jstMatch[2]) } : {}),
    })
  throw new Error(
    `Unsupported cable string: "${cableString}". Expected usb_c, jst_sh[_pinsN], jst_ph[_pinsN], us_mains, bullet[CONTACTS]_dNmm[_amale][_bfemale], or adaptercable_a(CONNECTOR)_b(CONNECTOR).`,
  )
}
