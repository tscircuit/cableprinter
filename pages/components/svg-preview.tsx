export function SvgPreview({ svg }: { svg: string }) {
  return (
    <div style={{ maxWidth: 1360 }}>
      <style>
        {".cable-svg > svg { width: 100%; height: auto; display: block; }"}
      </style>
      <div className="cable-svg" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}
