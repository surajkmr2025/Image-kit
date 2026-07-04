import Link from "next/link";
import { Image } from "@imagekit/next";
import type { IVideo } from "@/models/Video";

type VideoCardVideo = Omit<IVideo, "user"> & {
  _id?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

interface VideoCardProps {
  video: VideoCardVideo;
}

const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}…`;
};

const formatVideoDate = (value?: Date) => {
  if (!value) {
    return "Recently uploaded";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getUploaderName = (user: VideoCardVideo["user"]) => {
  if (!user) {
    return "Anonymous";
  }

  if (typeof user === "string") {
    return user;
  }

  return user.name ?? user.email ?? "Anonymous";
};

export default function VideoCard({ video }: VideoCardProps) {
  const videoId = video._id?.toString();

  return (
    <Link href={videoId ? `/videos/${videoId}` : "/videos"} className="group block h-full">
      <article className="card h-full border border-base-300 bg-base-100 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
        <figure className="relative aspect-video overflow-hidden bg-base-300">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={720}
            height={405}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </figure>

        <div className="card-body gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="card-title line-clamp-2 text-base-content">{video.title}</h2>
            <span className="badge badge-primary badge-sm">New</span>
          </div>

          <p className="text-sm leading-6 text-base-content/70">
            {truncateText(video.description, 120)}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-base-content/60">
            <span>{getUploaderName(video.user)}</span>
            <span>{formatVideoDate(video.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
