import { z } from "zod"

/** Nominal mating-contact diameters in mm, independent of the outer socket. */
export const bulletDiameterSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(3.5),
  z.literal(4),
  z.literal(5),
  z.literal(5.5),
  z.literal(6),
  z.literal(8),
])
export type BulletDiameter = z.infer<typeof bulletDiameterSchema>
export const bulletGenderSchema = z.enum(["male", "female"])
export type BulletGender = z.infer<typeof bulletGenderSchema>

/** Representative solder bullets, not manufacturer-specific production models.
 * Right-handed connector-local mm: mating tip/mouth at z=0, wire exits +Z.
 */
export function getBulletConnector({
  diameter,
  gender,
  pinCount = 1,
}: {
  diameter: BulletDiameter
  gender: BulletGender
  pinCount?: number
}) {
  const contactDepth = diameter * 2
  const bodyDiameter = diameter + (gender === "female" ? 1 : 0.6)
  return {
    kind:
      gender === "male" ? ("bullet_male" as const) : ("bullet_female" as const),
    diameter,
    contactDepth,
    pinCount,
    pitch: diameter + 2,
    bodyWidth: bodyDiameter + (pinCount - 1) * (diameter + 2),
    bodyHeight: bodyDiameter,
    bodyDepth: contactDepth + diameter * 1.5,
  }
}
