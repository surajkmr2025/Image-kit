import type { IVideo } from "@/models/Video"

export type VideoFormData = Omit<IVideo, "_id" | "user">

type FetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE"
    body?: unknown
    headers?: Record<string, string>
}

class ApiClient {
    private async fetch<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const { method = "GET", body, headers = {} } = options

        const defaultHeaders = {
            "Content-Type": "application/json",
            ...headers,
        }

        const baseUrl = typeof window === "undefined"
            ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
            : ""

        const response = await fetch(`${baseUrl}/api${endpoint}`, {
            method,
            headers: defaultHeaders,
            body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return response.json() as Promise<T>
    }

    async getVideos(search?: string) {
        const query = search
            ? `/videos?search=${encodeURIComponent(search)}`
            : '/videos';
        return this.fetch<IVideo[]>(query)
    }

    async createVideo(videoData: VideoFormData) {
        return this.fetch('/videos', {
            method: "POST",
            body: videoData,
        })
    }

    async deleteVideo(id: string) {
        return this.fetch(`/videos/${id}`, {
            method: "DELETE",
        });
    }
}

export const apiClient = new ApiClient()
