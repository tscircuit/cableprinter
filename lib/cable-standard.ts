import { z } from "zod"

export const cableStandardSchema = z.enum([
  "usb_c",
  "jst_sh",
  "jst_ph",
  "us_mains",
  "bullet",
  "adaptercable",
])
export type CableStandard = z.infer<typeof cableStandardSchema>
