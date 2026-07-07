import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import VideoModel, { type IVideo } from "@/models/Video";
import VideoCard from "@/app/components/VideoCard";

type DashboardVideo = Omit<IVideo, "user"> & {
  _id?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();

  const videos = await VideoModel.find({
    user: session.user.id,
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean<DashboardVideo[]>();

  return (
    <main className="min-h-screen bg-base-200 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold text-base-content">
            My Videos
          </h1>

          <p className="mt-3 text-base-content/70">
            Manage all the videos you've uploaded.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">
              You haven't uploaded any videos yet.
            </h2>

            <p className="mt-3 text-base-content/70">
              Upload your first video to see it here.
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