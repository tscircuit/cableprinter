import type { CableConnector } from "../../lib"

/** SVG illustrations only: no triangle meshes or CAD export. Dimensions in mm. */
export function connectorFaceSvg(connector: CableConnector): string {
  if (connector.kind === "usb_c_plug") {
    return `<rect x="${-connector.shellWidth / 2}" y="${-connector.shellHeight / 2}" width="${connector.shellWidth}" height="${connector.shellHeight}" rx="${connector.shellHeight / 2}" fill="#d3dce4" stroke="#697d8f" stroke-width=".14"/>
      <rect x="${-connector.shellWidth / 2 + 0.3}" y="${-connector.shellHeight / 2 + 0.3}" width="${connector.shellWidth - 0.6}" height="${connector.shellHeight - 0.6}" rx=".8" fill="#263449"/>
      <rect x="-2.8" y="-.25" width="5.6" height=".5" rx=".16" fill="#d4ae68"/>`
  }
  if ("pinCount" in connector) {
    const sockets = Array.from({ length: connector.pinCount }, (_, index) => {
      const x = (index - (connector.pinCount - 1) / 2) * connector.pitch
      const opening = connector.pitch === 1 ? 0.5 : 0.85
      return `<rect x="${x - opening / 2}" y="${-opening / 2}" width="${opening}" height="${opening}" rx=".08" fill="#263449"/><rect x="${x - opening / 4}" y="${-opening / 4}" width="${opening / 2}" height="${opening / 2}" fill="#b6a778"/>`
    }).join("")
    return `<rect x="${-connector.bodyWidth / 2}" y="${-connector.bodyHeight / 2}" width="${connector.bodyWidth}" height="${connector.bodyHeight}" rx=".18" fill="#faf8eb" stroke="#8293a5" stroke-width=".12"/>
      <rect x="${-connector.bodyWidth / 2 + 0.2}" y="${-connector.bodyHeight / 2 - 0.35}" width="${connector.bodyWidth - 0.4}" height=".45" rx=".12" fill="#e8e5d8" stroke="#8293a5" stroke-width=".08"/>${sockets}
      <path d="M${-connector.bodyWidth / 2 + 0.35},${connector.bodyHeight / 2 - 0.2} l.6,0 l-.3,-.45 z" fill="#566b80"/>`
  }
  if (connector.kind === "nema_5_15p") {
    return `<rect x="${-connector.bodyWidth / 2}" y="${-connector.bodyHeight / 2}" width="${connector.bodyWidth}" height="${connector.bodyHeight}" rx="6" fill="#263449" stroke="#54697e" stroke-width=".4"/>
      <rect x="-7.11" y="-8" width="1.52" height="6.35" rx=".18" fill="#cbb281"/>
      <rect x="5.59" y="-8" width="1.52" height="6.35" rx=".18" fill="#cbb281"/>
      <circle cx="0" cy="7.1" r="2.38" fill="#cbb281"/>`
  }
  return `<path d="M-9,-3 L-5,-6 H5 L9,-3 V6 H-9 Z" fill="#263449" stroke="#5f7589" stroke-width=".4"/>
    <rect x="-5.6" y="-.5" width="2.3" height="3.4" rx=".2" fill="#101d30"/>
    <rect x="3.3" y="-.5" width="2.3" height="3.4" rx=".2" fill="#101d30"/>
    <rect x="-1.15" y="-4.3" width="2.3" height="3.4" rx=".2" fill="#101d30"/>`
}

/** Side silhouette, mating direction to the left, wire exit to the right. */
export function connectorSideSvg(connector: CableConnector): string {
  const height = connector.bodyWidth
  const depth = connector.bodyDepth
  if ("pinCount" in connector) {
    return `<rect x="0" y="${-height / 2}" width="${depth}" height="${height}" rx=".4" fill="#f7f4e7" stroke="#7a8fa4" stroke-width=".22"/>
      <rect x="0" y="${-height / 2}" width=".8" height="${height}" fill="#e0dccb"/>
      ${Array.from({ length: connector.pinCount }, (_, index) => {
        const y = (index - (connector.pinCount - 1) / 2) * connector.pitch
        return `<rect x="${depth - 2}" y="${y - 0.3}" width="1.3" height=".6" fill="#c5c8bc" rx=".1"/>`
      }).join("")}`
  }
  const shell =
    connector.kind === "usb_c_plug"
      ? `<rect x="${-connector.shellDepth}" y="${-connector.shellWidth / 2}" width="${connector.shellDepth}" height="${connector.shellWidth}" rx="1.1" fill="#c1ccd6" stroke="#7b8e9f" stroke-width=".2"/><path d="M${-connector.shellDepth + 1},${-connector.shellWidth / 2 + 1} H-1" stroke="#eff4f7" stroke-width=".5"/>`
      : connector.kind === "nema_5_15p"
        ? `<rect x="-16" y="-6.5" width="17" height="1.5" rx=".6" fill="#cbb281"/><rect x="-16" y="5" width="17" height="1.5" rx=".6" fill="#cbb281"/>`
        : ""
  return `${shell}<rect x="0" y="${-height / 2}" width="${depth}" height="${height}" rx="${Math.min(height / 4, 4)}" fill="#263449" stroke="#536b80" stroke-width=".3"/>
    <rect x="1.5" y="${-height / 2 + 1}" width="${depth - 3}" height="${height - 2}" rx="${Math.min(height / 4, 3)}" fill="#314158"/>
    <path d="M${depth - 1},${-height / 3} v${(2 * height) / 3}" stroke="#182438" stroke-width="1"/>`
}
