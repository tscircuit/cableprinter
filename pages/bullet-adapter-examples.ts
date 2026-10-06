import { parseCableString } from "../lib"

export const bulletAdapterExamples = [1, 3].map((pinCount) => {
  const cableString = `bullet${pinCount === 1 ? "" : pinCount}_da3.5mm_db4mm_afemale`
  return {
    cableString,
    title: `${pinCount} contact${pinCount === 1 ? "" : "s"} / 3.5 mm female to 4 mm female`,
    subtitle: "Adapter cable for male motor outputs and male board plugs",
    annotation: "A: 3.5 mm female / B: 4 mm female / 6 mm common contact pitch",
    code: [`parseCableString("${cableString}")`],
    cable: parseCableString(cableString),
  }
})
