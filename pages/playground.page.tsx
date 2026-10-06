import { useMemo, useState } from "react"
import {
  cableStandardSchema,
  bulletDiameterSchema,
  type BulletDiameter,
  type BulletGender,
  type CableStandard,
  getCableDefinition,
} from "../lib"
import { previewCableMeshes, previewConnectorMeshes } from "./cable-meshes"
import { MeshCanvas } from "./components/mesh-canvas"

export default function Playground() {
  const [standard, setStandard] = useState<CableStandard>("jst_sh")
  const [pinCount, setPinCount] = useState(4)
  const [diameter, setDiameter] = useState<BulletDiameter>(3.5)
  const [genderA, setGenderA] = useState<BulletGender>("male")
  const [genderB, setGenderB] = useState<BulletGender>("female")
  const isJst = standard === "jst_sh" || standard === "jst_ph"
  const definition = useMemo(
    () =>
      getCableDefinition(
        standard === "bullet"
          ? { standard, diameter, genderA, genderB, pinCount }
          : isJst
            ? { standard, pinCount }
            : { standard },
      ),
    [standard, pinCount, isJst, diameter, genderA, genderB],
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
          onChange={(event) => {
            const next = cableStandardSchema.parse(event.target.value)
            setStandard(next)
            setPinCount((count) =>
              Math.max(
                next === "bullet" ? 1 : 2,
                Math.min(next === "jst_sh" ? 15 : 16, count),
              ),
            )
          }}
        >
          {cableStandardSchema.options.map((standard) => (
            <option key={standard}>{standard}</option>
          ))}
        </select>
      </label>{" "}
      {(isJst || standard === "bullet") && (
        <label>
          Contacts{" "}
          <input
            type="range"
            min={standard === "bullet" ? 1 : 2}
            max={standard === "jst_sh" ? 15 : 16}
            value={pinCount}
            onChange={(event) => setPinCount(Number(event.target.value))}
          />{" "}
          {pinCount}
        </label>
      )}
      {standard === "bullet" && (
        <>
          <label>
            Diameter{" "}
            <select
              value={diameter}
              onChange={(event) =>
                setDiameter(
                  bulletDiameterSchema.parse(Number(event.target.value)),
                )
              }
            >
              {[2, 3, 3.5, 4, 5, 5.5, 6, 8].map((diameter) => (
                <option key={diameter} value={diameter}>
                  {diameter} mm
                </option>
              ))}
            </select>
          </label>{" "}
          <label>
            End A{" "}
            <select
              value={genderA}
              onChange={(event) =>
                setGenderA(event.target.value === "male" ? "male" : "female")
              }
            >
              <option>male</option>
              <option>female</option>
            </select>
          </label>{" "}
          <label>
            End B{" "}
            <select
              value={genderB}
              onChange={(event) =>
                setGenderB(event.target.value === "male" ? "male" : "female")
              }
            >
              <option>male</option>
              <option>female</option>
            </select>
          </label>
        </>
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
