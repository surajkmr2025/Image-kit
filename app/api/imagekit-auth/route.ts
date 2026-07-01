import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authenticationParameters = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string, // Never expose this on client side
      publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,
      // expire: 30 * 60, // Optional, controls the expiry time of the token in seconds, maximum 1 hour in the future
      // token: "random-token", // Optional, a unique token for request
    });

    return NextResponse.json({
      authenticationParameters,
      publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY,
    });
  } catch (error) {
    console.log('Authentication error ', error)
    return NextResponse.json({
        error: "Authentication for Imagekit failed" 
    }, {status: 500});
  }
}
