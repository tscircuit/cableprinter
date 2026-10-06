import { bulletDiameterSchema } from "./bullet-connector"
import { type CableDefinition } from "./cable-definition"
import { getCableDefinition } from "./get-cable-definition"

/** Examples: usb_c, jst_sh_pins4, jst_ph_pins6, us_mains. */
export function parseCableString(cableString: string): CableDefinition {
  const cableName = cableString.trim().toLowerCase()
  if (cableName === "usb_c" || cableName === "us_mains") {
    return getCableDefinition({ standard: cableName })
  }
  const bulletMatch =
    /^bullet_([0-9]+(?:\.[0-9]+)?)mm(?:_(male|female)_(male|female))?$/.exec(
      cableName,
    )
  if (bulletMatch) {
    return getCableDefinition({
      standard: "bullet",
      diameter: bulletDiameterSchema.parse(Number(bulletMatch[1])),
      genderA: bulletMatch[2] === "female" ? "female" : "male",
      genderB: bulletMatch[3] === "male" ? "male" : "female",
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
    `Unsupported cable string: "${cableString}". Expected usb_c, jst_sh[_pinsN], jst_ph[_pinsN], us_mains, or bullet_Nmm[_male_female].`,
  )
}
