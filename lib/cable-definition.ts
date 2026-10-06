import { z } from "zod"
import { bulletDiameterSchema } from "./bullet-connector"
import { cableStandardSchema } from "./cable-input"

const dimension = z.number().finite().positive()
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const body = {
  bodyWidth: dimension,
  bodyHeight: dimension,
  bodyDepth: dimension,
}

/** Local mating face is at z=0, centered on x/y; the cable exits along +z. */
export const cableConnectorSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("bullet_male"),
      ...body,
      diameter: bulletDiameterSchema,
      pinCount: z.number().int().min(1).max(16).default(1),
      pitch: dimension,
      contactDepth: dimension,
    })
    .strict(),
  z
    .object({
      kind: z.literal("bullet_female"),
      ...body,
      diameter: bulletDiameterSchema,
      pinCount: z.number().int().min(1).max(16).default(1),
      pitch: dimension,
      contactDepth: dimension,
    })
    .strict(),
  z
    .object({
      kind: z.literal("usb_c_plug"),
      ...body,
      shellWidth: dimension,
      shellHeight: dimension,
      shellDepth: dimension,
    })
    .strict(),
  z
    .object({
      kind: z.literal("jst_sh_housing"),
      ...body,
      pinCount: z.number().int().min(2).max(15),
      pitch: z.literal(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal("jst_ph_housing"),
      ...body,
      pinCount: z.number().int().min(2).max(16),
      pitch: z.literal(2),
    })
    .strict(),
  z.object({ kind: z.literal("nema_5_15p"), ...body }).strict(),
  z.object({ kind: z.literal("iec_c13"), ...body }).strict(),
])
export type CableConnector = z.infer<typeof cableConnectorSchema>

export const cableCrossSectionSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("round_jacket"),
      diameter: dimension,
      color,
    })
    .strict(),
  z
    .object({
      kind: z.literal("wire_bundle"),
      wires: z.array(z.object({ diameter: dimension, color }).strict()).min(2),
      wirePitch: dimension,
    })
    .strict(),
])

/** A physical cable definition, independent of world placement and route. */
export const cableDefinitionSchema = z
  .object({
    standard: cableStandardSchema,
    connectorA: cableConnectorSchema,
    connectorB: cableConnectorSchema,
    crossSection: cableCrossSectionSchema,
  })
  .strict()
  .superRefine((cable, ctx) => {
    const { connectorA, connectorB, crossSection } = cable
    const expected = {
      usb_c: ["usb_c_plug", "usb_c_plug"],
      jst_sh: ["jst_sh_housing", "jst_sh_housing"],
      jst_ph: ["jst_ph_housing", "jst_ph_housing"],
      us_mains: ["nema_5_15p", "iec_c13"],
      bullet: [connectorA.kind, connectorB.kind],
    }[cable.standard]
    if (connectorA.kind !== expected[0] || connectorB.kind !== expected[1]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Connector kinds must match the cable standard",
      })
    }
    if (cable.standard === "bullet") {
      if (
        !("diameter" in connectorA) ||
        !("diameter" in connectorB) ||
        ("pinCount" in connectorA &&
          "pinCount" in connectorB &&
          connectorA.pinCount !== connectorB.pinCount)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Bullet connectors require supported nominal diameters and matching contact counts",
        })
      }
      if (
        "pinCount" in connectorA &&
        ((connectorA.pinCount === 1 && crossSection.kind !== "round_jacket") ||
          (connectorA.pinCount > 1 && crossSection.kind !== "wire_bundle"))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bullet cables require one insulated wire per contact",
        })
      }
      for (const connector of [connectorA, connectorB]) {
        if (
          "diameter" in connector &&
          (connector.bodyHeight <= connector.diameter ||
            connector.pitch < connector.bodyHeight ||
            Math.abs(
              connector.bodyWidth -
                (connector.bodyHeight +
                  (connector.pinCount - 1) * connector.pitch),
            ) > 1e-6 ||
            (crossSection.kind === "wire_bundle" &&
              (crossSection.wirePitch !== connector.pitch ||
                crossSection.wires.some(
                  (wire) => wire.diameter > connector.bodyHeight,
                ))) ||
            connector.contactDepth >= connector.bodyDepth ||
            (crossSection.kind === "round_jacket" &&
              crossSection.diameter > connector.bodyHeight))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Bullet contact, body, and wire dimensions must fit",
          })
        }
      }
    } else if ("diameter" in connectorA || "diameter" in connectorB) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bullet connectors require the bullet cable standard",
      })
    }
    if (crossSection.kind === "wire_bundle") {
      for (const connector of [connectorA, connectorB]) {
        if (
          !("pinCount" in connector) ||
          connector.pinCount !== crossSection.wires.length
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Bundle wire count must match each connector pin count",
          })
        }
      }
      if (
        crossSection.wires.some(
          (wire) => wire.diameter > crossSection.wirePitch,
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bundle wires must not overlap in the cross section",
        })
      }
    } else if (cable.standard === "jst_sh" || cable.standard === "jst_ph") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JST cables require a wire bundle",
      })
    }
  })
export type CableDefinition = z.infer<typeof cableDefinitionSchema>
