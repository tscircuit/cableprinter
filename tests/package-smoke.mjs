import assert from "node:assert/strict"
import {
  cableDefinitionSchema,
  getCableDefinition,
  parseCableString,
} from "@tscircuit/cableprinter"

for (const [model, standard] of [
  ["usb_c", "usb_c"],
  ["jst_sh_pins4", "jst_sh"],
  ["jst_ph_pins6", "jst_ph"],
  ["us_mains", "us_mains"],
]) {
  const cable = cableDefinitionSchema.parse(parseCableString(model))
  assert.equal(cable.standard, standard)
}
assert.equal(
  getCableDefinition({ standard: "jst_ph", pinCount: 6 }).connectorA.pinCount,
  6,
)
console.log(
  "Published ESM entrypoint works in Node for USB-C, JST SH, JST PH and US mains",
)
