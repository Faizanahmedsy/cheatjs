import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Billu Class: free visual lessons for DSA, Gen AI, AWS and JavaScript";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: Billu on the left, the class name and subjects on the right. */
export default async function OpenGraphImage() {
  const png = await readFile(path.join(process.cwd(), "src/app/icon.png"));
  const src = `data:image/png;base64,${png.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 56, padding: 72, background: "#09090b", color: "#f6f4ef" }}>
        <div style={{ display: "flex", width: 340, height: 340, borderRadius: 48, background: "#fdf3dc", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={300} height={300} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 28, letterSpacing: 4, color: "#f5793f", fontWeight: 700 }}>USTAD BILLU PRESENTS</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>Billu Class</div>
          <div style={{ fontSize: 34, color: "#d3cdc1", marginTop: 20 }}>Watch code run. Break AWS. See how AI works.</div>
          <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
            {["DSA", "Gen AI", "AWS", "JavaScript"].map((label) => (
              <div key={label} style={{ fontSize: 26, padding: "10px 22px", borderRadius: 999, border: "2px solid #3a3a36", color: "#f6f4ef" }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
