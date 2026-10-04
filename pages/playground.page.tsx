import { useState } from "react"
import {
  cableStandardSchema,
  type CableStandard,
  getCableDefinition,
} from "../lib"
import { cableExamples } from "./cable-examples"
import { singleCableSvg } from "./components/catalog-svg"
import { SvgPreview } from "./components/svg-preview"

export default function Playground() {
  const [standard, setStandard] = useState<CableStandard>("jst_sh")
  const [pinCount, setPinCount] = useState(4)
  const isJst = standard === "jst_sh" || standard === "jst_ph"
  const cableInput = isJst ? { standard, pinCount } : { standard }
  const cable = getCableDefinition(cableInput)
  const example = cableExamples.find(
    (example) => example.cable.standard === standard,
  )!
  return (
    <>
      <h1>Cable definition playground</h1>
      <p>
        Change the physical definition; the presentation curve stays
        independent.
      </p>
      <label>
        Standard{" "}
        <select
          value={standard}
          onChange={(event) =>
            setStandard(cableStandardSchema.parse(event.target.value))
          }
        >
          {cableStandardSchema.options.map((standard) => (
            <option key={standard}>{standard}</option>
          ))}
        </select>
      </label>{" "}
      {isJst && (
        <label>
          Contacts{" "}
          <input
            type="range"
            min={2}
            max={15}
            value={pinCount}
            onChange={(event) => setPinCount(Number(event.target.value))}
          />{" "}
          {pinCount}
        </label>
      )}
      <SvgPreview
        svg={singleCableSvg({
          ...example,
          cable,
          subtitle: isJst
            ? `${pinCount} positions / matching conductor count`
            : example.subtitle,
          code: JSON.stringify(cableInput, null, 2).split("\n"),
          annotation: `${cable.connectorA.bodyWidth} x ${cable.connectorA.bodyHeight} x ${cable.connectorA.bodyDepth} mm connector A body`,
        })}
      />
      <details>
        <summary>Normalized definition JSON</summary>
        <pre>{JSON.stringify(cable, null, 2)}</pre>
      </details>
    </>
  )
}
