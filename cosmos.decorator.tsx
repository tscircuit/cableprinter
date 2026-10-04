import type { ReactNode } from "react"
import "./pages/gallery.css"

export default function Decorator({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        margin: 0,
        padding: 24,
        background: "#eef2f6",
        minHeight: "100vh",
        fontFamily: "system-ui",
      }}
    >
      {children}
    </div>
  )
}
