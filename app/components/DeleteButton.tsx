"use client";

import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
}

export default function DeleteButton({
  id,
}: DeleteButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this video?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await apiClient.deleteVideo(id);

      toast.success("Video deleted");

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Delete failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-error btn-sm"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        "Delete"
      )}
    </button>
  );
}