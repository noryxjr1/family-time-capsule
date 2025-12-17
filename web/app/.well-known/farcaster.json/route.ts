import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type AccountAssociation = {
  header: string;
  payload: string;
  signature: string;
};

async function loadAccountAssociation(): Promise<AccountAssociation> {
  const filePath = path.join(process.cwd(), "accountAssociation.json");
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as AccountAssociation;

  if (!parsed?.header || !parsed?.payload || !parsed?.signature) {
    throw new Error("accountAssociation.json is missing required fields.");
  }

  return parsed;
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const accountAssociation = await loadAccountAssociation();

  const manifest = {
    accountAssociation,
    frame: {
      version: "next",
      name: "Family Memory Capsule",
      homeUrl: origin,
      iconUrl: `${origin}/icon.svg`,
      splashImageUrl: `${origin}/splash.svg`,
      splashBackgroundColor: "#ffffff",
    },
  };

  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
