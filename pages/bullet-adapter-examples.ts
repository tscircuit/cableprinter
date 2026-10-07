import { parseCableString } from "../lib"

export const bulletAdapterExamples = [1, 3].map((pinCount) => {
  const prefix = `bullet${pinCount === 1 ? "" : pinCount}`
  const cableString = `adaptercable_a(${prefix}_d3.5mm_gfemale)_b(${prefix}_d4mm_gfemale)`
  return {
    cableString,
    title: `${pinCount} contact${pinCount === 1 ? "" : "s"} / 3.5 mm female to 4 mm female`,
    subtitle: "Adapter cable for male motor outputs and male board plugs",
    annotation:
      "A: 3.5 mm female at 5.5 mm pitch / B: 4 mm female at 6 mm pitch",
    code: [`parseCableString("${cableString}")`],
    cable: parseCableString(cableString),
  }
})

for (const [a, b, title, annotation] of [
  [
    "bullet3_d3.5mm_gfemale",
    "jst_ph_pins3",
    "Bullet to JST PH / three contacts",
    "A: three 3.5 mm female bullets / B: three-pin 2 mm pitch PH housing",
  ],
  [
    "jst_sh_pins4",
    "jst_ph_pins4",
    "JST SH to PH / four contacts",
    "A: 1 mm pitch SH housing / B: 2 mm pitch PH housing / four wires",
  ],
]) {
  const cableString = `adaptercable_a(${a})_b(${b})`
  bulletAdapterExamples.push({
    cableString,
    title: title!,
    subtitle: "Independent connector families and contact pitches",
    annotation: annotation!,
    code: [`parseCableString("${cableString}")`],
    cable: parseCableString(cableString),
  })
}
