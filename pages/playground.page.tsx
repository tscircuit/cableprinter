import { useMemo, useState } from "react"
import {
  cableStandardSchema,
  type CableStandard,
  getCableDefinition,
} from "../lib"
import { previewCableMeshes, previewConnectorMeshes } from "./cable-meshes"
import { MeshCanvas } from "./components/mesh-canvas"

export default function Playground() {
  const [standard, setStandard] = useState<CableStandard>("jst_sh")
  const [pinCount, setPinCount] = useState(4)
  const isJst = standard === "jst_sh" || standard === "jst_ph"
  const definition = useMemo(
    () => getCableDefinition(isJst ? { standard, pinCount } : { standard }),
    [standard, pinCount, isJst],
  )
  const meshes = useMemo(() => previewCableMeshes(definition), [definition])
  const connectorMeshes = useMemo(
    () => previewConnectorMeshes({ definition }),
    [definition],
  )
  return (
    <>
      <h1>3D cable mesh playground</h1>
      <p>
        Actual triangle meshes from jscad-electronics, rendered with poppygl.
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
      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        <MeshCanvas meshes={meshes} />
        <MeshCanvas meshes={connectorMeshes} detail />
      </div>
      <p>
        {meshes.reduce((count, mesh) => count + mesh.indices.length / 3, 0)}{" "}
        triangles / {meshes.length} material meshes
      </p>
      <details>
        <summary>Definition JSON</summary>
        <pre>{JSON.stringify(definition, null, 2)}</pre>
      </details>
    </>
  )
}
