import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function parseDataUrl(dataUrl: string) {
  // data:image/png;base64,AAAA...
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> } // ✅ required by your build typing
) {
  try {
    const { id: postId } = await context.params;

    const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB); // ✅ works because your URI likely includes db, else set MONGODB_DB

    // ✅ IMPORTANT: Query by { id: postId } (your schema)
    const post = await db.collection("posts").findOne(
      { id: postId },
      { projection: { mediaDataUrl: 1 } }
    );

    const mediaDataUrl = post?.mediaDataUrl;

    if (!mediaDataUrl || typeof mediaDataUrl !== "string") {
      return new NextResponse("Not found", { status: 404 });
    }

    // If it's already a URL (not base64), redirect
    if (!mediaDataUrl.startsWith("data:")) {
      return NextResponse.redirect(mediaDataUrl);
    }

    const parsed = parseDataUrl(mediaDataUrl);
    if (!parsed) return new NextResponse("Invalid media", { status: 400 });

    const buffer = Buffer.from(parsed.base64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": parsed.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}