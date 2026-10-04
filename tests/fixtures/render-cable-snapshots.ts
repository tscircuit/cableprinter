import { Resvg } from "@resvg/resvg-js"
import { join } from "node:path"
import { encodePNG } from "poppygl"
import { getCableDefinition, parseCableString } from "../../lib"
import { cableExamples } from "../../pages/cable-examples"
import {
  previewCableMeshes,
  previewConnectorMeshes,
  previewCablePath,
} from "../../pages/cable-meshes"
import { renderCableMeshes } from "../../pages/render-cable-meshes"
import { createCableMeshes, type CableMesh } from "jscad-electronics/cables"

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
function label({
  text,
  x,
  y,
  size = 17,
}: {
  text: string
  x: number
  y: number
  size?: number
}) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="#20344d" xml:space="preserve">${escapeXml(text)}</text>`
}
async function meshImage({
  meshes,
  x,
  y,
  width,
  height,
  detail = false,
  sharedCamera = false,
}: {
  meshes: CableMesh[]
  x: number
  y: number
  width: number
  height: number
  detail?: boolean
  sharedCamera?: boolean
}) {
  const { bitmap } = renderCableMeshes(meshes, {
    width,
    height,
    detail,
    ...(sharedCamera
      ? { camPos: [12, 10, -29] as const, lookAt: [0, 0, -3] as const }
      : {}),
  })
  return `<image x="${x}" y="${y}" width="${width}" height="${height}" href="data:image/png;base64,${Buffer.from(await encodePNG(bitmap)).toString("base64")}"/>`
}
function compose({
  width,
  height,
  content,
}: {
  width: number
  height: number
  content: string[]
}) {
  // SVG is used only for text and PNG layout; every model pixel comes from poppygl.
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="Roboto Mono"><rect width="100%" height="100%" fill="#e8edf3"/>${content.join("")}</svg>`,
    {
      font: {
        loadSystemFonts: false,
        fontFiles: [join(import.meta.dir, "RobotoMono.ttf")],
        defaultFontFamily: "Roboto Mono",
      },
    },
  )
    .render()
    .asPng()
}

export async function renderCableCatalog(): Promise<Uint8Array> {
  const width = 1720
  const rowHeight = 440
  const content = [
    label({
      text: "cableprinter / 3D cable meshes rendered with poppygl",
      x: 28,
      y: 44,
      size: 28,
    }),
  ]
  for (const [index, example] of cableExamples.entries()) {
    const y = 82 + index * rowHeight
    content.push(
      `<rect x="20" y="${y}" width="1680" height="422" rx="12" fill="#fff"/>`,
      label({ text: example.title, x: 40, y: y + 35, size: 23 }),
      `<rect x="34" y="${y + 60}" width="416" height="285" rx="8" fill="#f1f4f8"/>`,
      ...[
        "const definition =",
        `  parseCableString("${example.cableString}")`,
        "",
        "const meshes = createCableMeshes({",
        "  definition,",
        "  path: resolvedPath,",
        "})",
      ].map((text, line) =>
        label({ text, x: 48, y: y + 94 + line * 25, size: 17 }),
      ),
      label({
        text: "CABLE ASSEMBLY / ISOMETRIC",
        x: 485,
        y: y + 67,
        size: 14,
      }),
      await meshImage({
        meshes: previewCableMeshes(example.cable),
        x: 460,
        y: y + 80,
        width: 720,
        height: 300,
      }),
      label({ text: "CONNECTOR DETAIL", x: 1220, y: y + 67, size: 14 }),
      await meshImage({
        meshes: previewConnectorMeshes({ definition: example.cable }),
        x: 1200,
        y: y + 88,
        width: example.cable.standard === "us_mains" ? 230 : 460,
        height: 265,
        detail: true,
      }),
      label({ text: example.annotation, x: 40, y: y + 397, size: 17 }),
    )
    if (example.cable.standard === "us_mains")
      content.push(
        await meshImage({
          meshes: previewConnectorMeshes({
            definition: example.cable,
            end: "B",
          }),
          x: 1430,
          y: y + 88,
          width: 230,
          height: 265,
          detail: true,
        }),
      )
  }
  content.push(
    label({
      text: "Actual indexed meshes / supplied fixture paths / routing and sagging remain separate",
      x: 28,
      y: 1860,
      size: 17,
    }),
  )
  return compose({ width, height: 1890, content })
}

export async function renderJstComparison(): Promise<Uint8Array> {
  const content = [
    label({
      text: "JST SH and PH / connector details at a common camera scale",
      x: 28,
      y: 44,
      size: 25,
    }),
  ]
  for (const [row, standard] of (["jst_sh", "jst_ph"] as const).entries()) {
    for (const [column, pinCount] of [2, 4, 6].entries()) {
      const definition = getCableDefinition({ standard, pinCount })
      const x = 20 + column * 520
      const y = 85 + row * 590
      content.push(
        `<rect x="${x}" y="${y}" width="500" height="570" rx="12" fill="#fff"/>`,
        label({
          text: `${standard} / ${pinCount} pins`,
          x: x + 20,
          y: y + 35,
          size: 23,
        }),
        label({
          text: `parseCableString("${standard}_pins${pinCount}")`,
          x: x + 20,
          y: y + 65,
          size: 17,
        }),
        await meshImage({
          meshes: previewConnectorMeshes({ definition }),
          x: x + 20,
          y: y + 90,
          width: 460,
          height: 240,
          detail: true,
          sharedCamera: true,
        }),
        await meshImage({
          meshes: previewCableMeshes(definition),
          x: x + 20,
          y: y + 335,
          width: 460,
          height: 180,
        }),
        label({
          text: `${definition.connectorA.bodyWidth} x ${definition.connectorA.bodyHeight} x ${definition.connectorA.bodyDepth} mm`,
          x: x + 20,
          y: y + 547,
          size: 17,
        }),
      )
    }
  }
  return compose({ width: 1580, height: 1290, content })
}

export async function renderMultipleCables(): Promise<Uint8Array> {
  const meshes = ["usb_c", "jst_ph_pins4", "us_mains"].flatMap(
    (cableString, index) => {
      const path = previewCablePath({ span: 135 }).map(
        ([x, y, z]) =>
          [x, y + index * 65, z + index * 8] as [number, number, number],
      )
      return createCableMeshes({
        definition: parseCableString(cableString),
        path,
      })
    },
  )
  return compose({
    width: 1640,
    height: 830,
    content: [
      label({
        text: "Multiple cables / independent resolved centerlines",
        x: 28,
        y: 44,
        size: 28,
      }),
      '<rect x="20" y="82" width="1600" height="706" rx="12" fill="#fff"/>',
      ...[
        "const definitions = [",
        '  parseCableString("usb_c"),',
        '  parseCableString("jst_ph_pins4"),',
        '  parseCableString("us_mains"),',
        "]",
        "",
        "definitions.map((definition, i) =>",
        "  createCableMeshes({",
        "    definition,",
        "    path: resolvedPaths[i],",
        "  }))",
      ].map((text, index) =>
        label({ text, x: 45, y: 130 + index * 26, size: 17 }),
      ),
      await meshImage({ meshes, x: 470, y: 108, width: 1120, height: 615 }),
      label({
        text: "USB-C + four-wire PH harness + grounded mains cord; no mesh-generation code in the spec package",
        x: 35,
        y: 765,
        size: 16,
      }),
    ],
  })
}
