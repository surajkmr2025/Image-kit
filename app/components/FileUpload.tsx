"use client" // This component must be a client component

import {
    // ImageKitAbortError,
    // ImageKitInvalidRequestError,
    // ImageKitServerError,
    // ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import { log } from "console";
import { useState } from "react";
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

    //optional validation

    const validateFile = (file: File) => {

        console.log("fileType prop:", fileType);
        console.log("file.type:", file.type);
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (uploading) return;
        const input = e.target;
        const file = e.target.files?.[0]

        console.log(file);
        console.log("Name:", file?.name);
        console.log("Type:", file?.type);

        setError(null)

        if (!file || !validateFile(file)) return

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

            console.log("Upload failed", error)
        }
        finally {
            setUploading(false)
            onUploadStateChange?.(false)
            input.value = "";
        }
    }



    return (
        <>
            <input type="file"
                disabled={uploading}
                accept={fileType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileChange}
                aria-label="file"
            />

            {error && (
                <p className="text-error text-sm mt-2">
                    {error}
                </p>
            )}
            {uploading && (
                <span className="loading loading-spinner loading-md"></span>
            )}

        </>
    );
};

export default FileUpload;