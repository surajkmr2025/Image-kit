import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { imagekit } from "@/lib/imagekit";
import VideoModel, { type IVideo } from "@/models/Video";

export const dynamic = "force-dynamic";

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

type VideoWithUser = Omit<IVideo, "user"> & {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const formatVideoDate = (value?: Date) => {
  if (!value) {
    return "Recently uploaded";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  await connectToDatabase();

  const video = await VideoModel.findById(id)
    .populate("user", "name email")
    .lean<VideoWithUser | null>();

  if (!video) {
    notFound();
  }

  const uploaderName = video.user?.name || video.user?.email || "Anonymous";
  const signedVideoUrl = imagekit.url({
    src: video.videoUrl,
    signed: true,
  });

  return (
    <main className="min-h-screen bg-base-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
          <div className="aspect-video w-full bg-base-300">
            <video
              src={signedVideoUrl}
              controls={video.controls ?? true}
              className="h-full w-full object-cover"
              preload="metadata"
            />
          </div>

          <div className="space-y-6 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-primary">Featured video</span>
                  <span className="badge badge-outline">{formatVideoDate(video.createdAt)}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
                  {video.title}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-base-content/70">
                  {video.description}
                </p>
              </div>

              <div className="rounded-box border border-base-300 bg-base-200/70 p-4 text-sm text-base-content/70">
                <p className="font-semibold text-base-content">Uploaded by</p>
                <p className="mt-1">{uploaderName}</p>
                <p className="mt-2">{formatVideoDate(video.createdAt)}</p>
              </div>
            </div>

            <div className="grid gap-4 rounded-box border border-base-300 bg-base-200/50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-base-content/50">
                  Title
                </p>
                <p className="mt-2 font-medium text-base-content">{video.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-base-content/50">
                  Uploader
                </p>
                <p className="mt-2 font-medium text-base-content">{uploaderName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-base-content/50">
                  Upload date
                </p>
                <p className="mt-2 font-medium text-base-content">{formatVideoDate(video.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


