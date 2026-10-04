import { useEffect, useRef } from "react"
import type { CableMesh } from "jscad-electronics/cables"
import { renderCableMeshes } from "../render-cable-meshes"

export function MeshCanvas({
  meshes,
  detail = false,
}: {
  meshes: CableMesh[]
  detail?: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const { bitmap } = renderCableMeshes(meshes, {
      width: 720,
      height: 420,
      supersampling: 1,
      detail,
    })
    const context = canvas.getContext("2d")!
    const pixels = context.createImageData(bitmap.width, bitmap.height)
    pixels.data.set(bitmap.data)
    context.putImageData(pixels, 0, 0)
  }, [meshes, detail])
  return (
    <canvas
      ref={ref}
      width={720}
      height={420}
      style={{
        width: "100%",
        maxWidth: 720,
        height: "auto",
        background: "white",
      }}
    />
  )
}
