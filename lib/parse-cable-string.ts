import { bulletDiameterSchema } from "./bullet-connector"
import { type CableDefinition } from "./cable-definition"
import { getCableDefinition } from "./get-cable-definition"

/** Examples: usb_c, jst_sh_pins4, jst_ph_pins6, us_mains. */
export function parseCableString(cableString: string): CableDefinition {
  const cableName = cableString.trim().toLowerCase()
  if (cableName === "usb_c" || cableName === "us_mains") {
    return getCableDefinition({ standard: cableName })
  }
  const bulletMatch = /^bullet([1-9][0-9]*)?_(.+)$/.exec(cableName)
  if (bulletMatch) {
    let diameter: number | undefined
    let diameterA: number | undefined
    let diameterB: number | undefined
    let genderA: "male" | "female" | undefined
    let genderB: "male" | "female" | undefined
    const seen = new Set<string>()
    for (const parameter of bulletMatch[2]!.split("_")) {
      const match =
        /^(d|da|db)([0-9]+(?:\.[0-9]+)?)mm$/.exec(parameter) ??
        /^(a|b)(male|female)$/.exec(parameter)
      if (!match || seen.has(match[1]!))
        throw new Error(`Invalid or duplicate bullet parameter: "${parameter}"`)
      seen.add(match[1]!)
      if (match[1] === "d") diameter = Number(match[2])
      else if (match[1] === "da") diameterA = Number(match[2])
      else if (match[1] === "db") diameterB = Number(match[2])
      else if (match[1] === "a") genderA = match[2] as "male" | "female"
      else genderB = match[2] as "male" | "female"
    }
    if (
      diameter === undefined &&
      (diameterA === undefined || diameterB === undefined)
    )
      throw new Error("Bullet cables require dNmm, or both daNmm and dbNmm")
    return getCableDefinition({
      standard: "bullet",
      ...(diameter !== undefined
        ? { diameter: bulletDiameterSchema.parse(diameter) }
        : {}),
      ...(diameterA !== undefined
        ? { diameterA: bulletDiameterSchema.parse(diameterA) }
        : {}),
      ...(diameterB !== undefined
        ? { diameterB: bulletDiameterSchema.parse(diameterB) }
        : {}),
      pinCount: bulletMatch[1] ? Number(bulletMatch[1]) : 1,
      genderA: genderA ?? "male",
      genderB: genderB ?? "female",
    })
  }
  const jstMatch = /^(jst_sh|jst_ph)(?:_pins([0-9]+))?$/.exec(cableName)
  if (jstMatch) {
    return getCableDefinition({
      standard: jstMatch[1] === "jst_sh" ? "jst_sh" : "jst_ph",
      ...(jstMatch[2] ? { pinCount: Number(jstMatch[2]) } : {}),
    })
  }
  throw new Error(
    `Unsupported cable string: "${cableString}". Expected usb_c, jst_sh[_pinsN], jst_ph[_pinsN], us_mains, or bullet[CONTACTS]_dNmm[_amale][_bfemale].`,
  )
}
