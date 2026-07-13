import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import VideoModel, { type IVideo } from "@/models/Video";
import VideoCard from "@/app/components/VideoCard";
import LogoutButton from "../components/LogoutButton";
import DeleteButton from "../components/DeleteButton";
import Link from "next/link";

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

  const totalVideos = videos.length;

  return (
    <main className="min-h-screen bg-base-200 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="mx-auto max-w-7xl space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-200 to-base-300 p-6 shadow-lg transition-shadow hover:shadow-xl sm:p-8">
            {/* Subtle decorative background */}
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Left content */}
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7 text-primary"
                  >
                    <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                  </svg>
                  My Videos
                </h2>
                <p className="mt-2 text-base text-base-content/70">
                  Manage your uploaded videos
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                  </span>
                  <span className="font-bold">{totalVideos}</span> video{totalVideos !== 1 && "s"}
                </div>
              </div>

              {/* Upload button */}
              <Link
                href="/upload"
                className="group btn btn-primary min-w-[160px] gap-2 px-5 py-3 text-base font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform group-hover:rotate-90"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                Upload New Video
              </Link>
            </div>
          </div>
        </div>
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
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-base-300/70 bg-gradient-to-b from-base-100 to-base-200 px-6 py-20 text-center shadow-sm">
            {/* Empty state icon */}
            <div className="mb-6 inline-flex rounded-full bg-primary/10 p-4 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold tracking-tight">
              You haven't uploaded any videos yet.
            </h2>
            <p className="mt-3 max-w-md text-base text-base-content/70">
              Upload your first video to see it here and start sharing with your audience.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video._id?.toString() ?? video.title}
                className="group flex flex-col overflow-hidden rounded-xl bg-base-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Video thumbnail & info (your existing component) */}
                <VideoCard video={video} />

                {/* Card footer with delete action – always visible, right‑aligned */}
                <div className="flex justify-end bg-base-200/50 px-4 py-2">
                  <DeleteButton id={video._id!.toString()} />
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}