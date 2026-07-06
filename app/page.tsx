import { connectToDatabase } from "@/lib/db";
import VideoModel, { type IVideo } from "@/models/Video";
import VideoCard from "@/app/components/VideoCard";

type VideoListItem = Omit<IVideo, "user"> & {
  _id?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export default async function HomePage() {
  await connectToDatabase();

  const videos = await VideoModel.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean<VideoListItem[]>();

  return (
    <main className="min-h-screen bg-base-200 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Discover
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-base-content sm:text-5xl">
            Watch the latest videos
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-base-content/70 sm:mx-0">
            Browse fresh content, discover new creators, and jump straight into
            the details for every upload.
          </p>
        </section>

        {videos.length === 0 ? (
          <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-base-content">
              No videos yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-base-content/70">
              Be the first to upload a video and share it with the community.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <VideoCard
                key={video._id?.toString() ?? video.title}
                video={video}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}