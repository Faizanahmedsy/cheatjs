import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

/** PWA icons: Ustad Billu on his cream tile. */
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = size === "512" ? 512 : 192;
  const png = await readFile(path.join(process.cwd(), "src/app/icon.png"));
  const src = `data:image/png;base64,${png.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf3dc" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={px * 0.86} height={px * 0.86} alt="" />
      </div>
    ),
    { width: px, height: px },
  );
}
