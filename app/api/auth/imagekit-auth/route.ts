import { authOptions } from "@/lib/auth";
import { getUploadAuthParams } from "@imagekit/next/server";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      return NextResponse.json(
        { error: "ImageKit is not configured" },
        { status: 500 },
      );
    }

    const authenticationParameters = getUploadAuthParams({
      privateKey,
      publicKey,
    });

    return NextResponse.json({
      ...authenticationParameters,
      publicKey,
    });
  } catch (error) {
    console.log("Authentication error ", error);
    return NextResponse.json(
      {
        error: "Authentication for Imagekit failed",
      },
      { status: 500 },
    );
  }
}
