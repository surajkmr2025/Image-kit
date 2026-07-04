"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import FileUpload from "@/app/components/FileUpload";
import { apiClient, type VideoFormData } from "@/lib/api-client";

const initialFormState = {
  title: "",
  description: "",
};

const UploadPage = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialFormState);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormState | "video" | "thumbnail", string>>>({});

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const extractUrl = (response: unknown): string => {
    if (typeof response === "object" && response !== null) {
      const data = response as Record<string, unknown>;
      if (typeof data.url === "string") return data.url;
      if (typeof data.filePath === "string") return data.filePath;
      if (typeof data.thumbnailUrl === "string") return data.thumbnailUrl;
    }
    return "";
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof typeof initialFormState | "video" | "thumbnail", string>> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required";
    }

    if (!videoUrl) {
      nextErrors.video = "Please upload a video";
    }

    if (!thumbnailUrl) {
      nextErrors.thumbnail = "Please upload a thumbnail";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const videoPayload: VideoFormData = {
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl,
        thumbnailUrl,
        controls: true,
        transformation: {
          width: 1080,
          height: 1920,
          quality: 100,
        },
      };

      await apiClient.createVideo(videoPayload);
      toast.success("Video uploaded successfully.");
      setForm(initialFormState);
      setVideoUrl("");
      setThumbnailUrl("");
      setUploadProgress(0);
      setErrors({});
      router.push("/dashboard");
    } catch (error) {
      console.error("Video upload failed", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Create content</p>
          <h1 className="mt-2 text-4xl font-bold text-base-content">Upload Video</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-base-content/70">
            Share your latest video with a polished thumbnail and a complete description.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card border border-base-300 bg-base-100 shadow-xl">
          <div className="card-body gap-6 p-6 sm:p-8">
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="form-control">
                <label className="label" htmlFor="title">
                  <span className="label-text font-medium">Title</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter a compelling title"
                  className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
                  disabled={loading}
                />
                {errors.title ? <p className="mt-2 text-sm text-error">{errors.title}</p> : null}
              </div>

              <div className="form-control">
                <label className="label" htmlFor="description">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell viewers what this video is about"
                  className={`textarea textarea-bordered h-28 w-full ${errors.description ? "textarea-error" : ""}`}
                  disabled={loading}
                />
                {errors.description ? <p className="mt-2 text-sm text-error">{errors.description}</p> : null}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-box border border-base-300 bg-base-200/60 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Upload Video</h2>
                  <span className="badge badge-primary">Required</span>
                </div>
                <div className="mt-4 space-y-3">
                  <FileUpload
                    fileType="video"
                    onUploadStateChange={setLoading}
                    onSuccess={(res) => {
                      const url = extractUrl(res);
                      setVideoUrl(url);
                      setErrors((prev) => ({ ...prev, video: undefined }));
                      setUploadProgress(0);
                    }}
                    onProgress={setUploadProgress}
                  />
                  {uploadProgress > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-base-content/70">
                        <span>Uploading video</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <progress className="progress progress-primary h-2 w-full" value={uploadProgress} max="100" />
                    </div>
                  ) : null}
                  {errors.video ? <p className="text-sm text-error">{errors.video}</p> : null}
                  {videoUrl ? <p className="break-all text-sm text-success">Video ready</p> : null}
                </div>
              </div>

              <div className="rounded-box border border-base-300 bg-base-200/60 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Upload Thumbnail</h2>
                  <span className="badge badge-secondary">Required</span>
                </div>
                <div className="mt-4 space-y-3">
                  <FileUpload
                    fileType="image"
                    onUploadStateChange={setLoading}
                    onSuccess={(res) => {
                      const url = extractUrl(res);
                      setThumbnailUrl(url);
                      setErrors((prev) => ({ ...prev, thumbnail: undefined }));
                      setUploadProgress(0);
                    }}
                    onProgress={setUploadProgress}
                  />
                  {errors.thumbnail ? <p className="text-sm text-error">{errors.thumbnail}</p> : null}
                  {thumbnailUrl ? <p className="break-all text-sm text-success">Thumbnail ready</p> : null}
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-base-300 pt-4 sm:flex-row sm:justify-end">
              <button type="button" className="btn btn-ghost" onClick={() => {
                setForm(initialFormState);
                setVideoUrl("");
                setThumbnailUrl("");
                setUploadProgress(0);
                setErrors({});
              }} disabled={loading}>
                Reset
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Please wait
                  </>
                ) : (
                  "Upload video"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default UploadPage;
