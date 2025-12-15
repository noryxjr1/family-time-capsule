import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ error: "PINATA_JWT is not set" }, { status: 500 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const pinataForm = new FormData();
    pinataForm.append("file", file, (file as any).name || "memory.enc");

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: pinataForm,
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "Pinata upload failed", detail }, { status: res.status });
    }

    const json = await res.json();
    const cid = json.IpfsHash as string;
    return NextResponse.json({ cid });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Unexpected error", detail }, { status: 500 });
  }
}
