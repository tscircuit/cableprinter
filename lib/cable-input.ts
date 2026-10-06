import { z } from "zod"
import { bulletDiameterSchema, bulletGenderSchema } from "./bullet-connector"

export const cableStandardSchema = z.enum([
  "usb_c",
  "jst_sh",
  "jst_ph",
  "us_mains",
  "bullet",
])
export type CableStandard = z.infer<typeof cableStandardSchema>

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const jacket = {
  jacketDiameter: z.number().finite().positive().default(4),
  color: color.default("#263449"),
}

/** Dimensions are millimeters; wireDiameter includes insulation. */
export const cableInputSchema = z
  .discriminatedUnion("standard", [
    z
      .object({
        standard: z.literal("bullet"),
        diameter: bulletDiameterSchema.optional(),
        diameterA: bulletDiameterSchema.optional(),
        diameterB: bulletDiameterSchema.optional(),
        pinCount: z.number().int().min(1).max(16).default(1),
        genderA: bulletGenderSchema.default("male"),
        genderB: bulletGenderSchema.default("female"),
        wireDiameter: z.number().finite().positive().default(2),
        color: color.default("#263449"),
      })
      .strict(),
    z.object({ standard: z.literal("usb_c"), ...jacket }).strict(),
    z
      .object({
        standard: z.literal("jst_sh"),
        pinCount: z.number().int().min(2).max(15).default(4),
        wireDiameter: z.number().finite().min(0.4).max(0.8).default(0.6),
      })
      .strict(),
    z
      .object({
        standard: z.literal("jst_ph"),
        pinCount: z.number().int().min(2).max(16).default(2),
        wireDiameter: z.number().finite().min(0.8).max(1.5).default(1.2),
      })
      .strict(),
    z
      .object({
        standard: z.literal("us_mains"),
        ...jacket,
        jacketDiameter: jacket.jacketDiameter.default(6.2),
      })
      .strict(),
  ])
  .superRefine((cable, ctx) => {
    if (
      cable.standard === "bullet" &&
      cable.diameter === undefined &&
      (cable.diameterA === undefined || cable.diameterB === undefined)
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide diameter, or both diameterA and diameterB",
      })
  })

export type CableInput = z.input<typeof cableInputSchema>
export type NormalizedCableInput = z.output<typeof cableInputSchema>
