import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo, VIDEO_DIMENSIONS } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const IMAGEKIT_ENDPOINT = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isSafeText = (value: unknown, maxLength: number) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= maxLength;

const isImageKitUrl = (value: unknown) =>
  typeof value === "string" &&
  !!IMAGEKIT_ENDPOINT &&
  value.startsWith(IMAGEKIT_ENDPOINT);

const isSafeFileId = (value: unknown) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= 256;

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 80);

    const query = search
      ? {
          title: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        }
      : {};
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch videos",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }
    await connectToDatabase();

    const body: Partial<IVideo> = await request.json();
    if (
      !isSafeText(body.title, 120) ||
      !isSafeText(body.description, 2000) ||
      !isImageKitUrl(body.videoUrl) ||
      !isImageKitUrl(body.thumbnailUrl) ||
      !isSafeFileId(body.videoFileId) ||
      !isSafeFileId(body.thumbnailFileId)
    ) {
      return NextResponse.json(
        {
          error: "Invalid video payload",
        },
        { status: 400 },
      );
    }

    const videoData = {
      ...body,
      user: session.user.id,
      controls: body?.controls ?? true,
      transformation: {
        height: VIDEO_DIMENSIONS.height,
        width: VIDEO_DIMENSIONS.width,
        quality: Math.min(Math.max(body.transformation?.quality ?? 100, 1), 100),
      },
    };

    const newVideo = await Video.create(videoData);
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Failed to create video:", error);
    return NextResponse.json(
      {
        error: "Failed to create video",
      },
      { status: 500 },
    );
  }
}
