export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function svgText({
  text,
  x,
  y,
  size = 16,
  fill = "#485b72",
}: {
  text: string
  x: number
  y: number
  size?: number
  fill?: string
}): string {
  return `<text xml:space="preserve" x="${x}" y="${y}" font-size="${size}" fill="${fill}">${escapeXml(text)}</text>`
}

export function svgDocument({
  width,
  height,
  content,
}: {
  width: number
  height: number
  content: string
}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Roboto Mono, monospace"><rect width="100%" height="100%" fill="#eef2f6"/>${content}</svg>`
}
