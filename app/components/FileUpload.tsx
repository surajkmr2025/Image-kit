"use client" // This component must be a client component

import {
    upload,
} from "@imagekit/next";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
    onSuccess: (res: unknown) => void
    onProgress?: (progress: number) => void
    onUploadStateChange?: (uploading: boolean) => void
    fileType?: "image" | "video"
}

const FileUpload = ({
    onSuccess,
    onProgress,
    onUploadStateChange,
    fileType
}: FileUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const validateFile = (file: File) => {
        if (fileType === 'video') {
            if (!file.type.startsWith('video/')) {
                setError("Please upload a valid video file")
                return false
            }
        }

        if (file.size > 100 * 1024 * 1024) {
            setError("File size must be less than 100 mb")
            return false
        }

        return true;
    }

    const uploadFile = async (file: File) => {
        if (uploading) return;

        setError(null)
        if (!validateFile(file)) return

        setUploading(true)
        onUploadStateChange?.(true)

        try {
            const authRes = await fetch('/api/auth/imagekit-auth')
            if (!authRes.ok) {
                throw new Error("Failed to get upload authentication");
            }
            const auth = await authRes.json()

            const res = await upload({
                file,
                fileName: file.name,
                publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
                signature: auth.signature,
                expire: auth.expire,
                token: auth.token,
                onProgress: (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percent = (event.loaded / event.total) * 100
                        onProgress(Math.round(percent))
                    }
                },
            });
            onSuccess(res)
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Upload failed"
            )
            console.error("Upload failed", error)
        } finally {
            setUploading(false)
            onUploadStateChange?.(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            void uploadFile(file)
        }
    }

    const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        preventDefaults(e)
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            void uploadFile(file)
        }
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        preventDefaults(e)
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        preventDefaults(e)
        setIsDragging(false)
    }



    return (
        <div>
            <div
                className={`rounded-xl border-2 border-dashed p-6 text-center transition ${isDragging ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200/40'}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label="File upload drop zone"
            >
                <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center justify-center gap-2 text-sm text-base-content/80">
                    <span className="text-base font-medium text-base-content">Drag & drop a file here</span>
                    <span className="text-xs">or click to browse</span>
                    <span className="badge badge-outline">{fileType === 'video' ? 'Video file' : 'Image file'}</span>
                </label>
                <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    disabled={uploading}
                    accept={fileType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileChange}
                    className="sr-only"
                />
            </div>

            {error && (
                <p className="text-error text-sm mt-2">
                    {error}
                </p>
            )}
            {uploading && (
                <div className="mt-3 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;