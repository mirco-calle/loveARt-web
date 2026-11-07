import client from "./client";

export interface AppBuild {
  id: number;
  name: string;
  version: string;
  apk_file: string;
  download_url?: string;
  description: string;
  updated_at: string;
}

const CoreAPI = {
  getLatestBuild: async (): Promise<AppBuild> => {
    const response = await client.get("/core/latest-build/");
    return response.data;
  },

  /**
   * Resolves the full downloadable APK URL.
   * If the backend returns a relative URL, it prefixes the backend domain
   * instead of resolving against Netlify.
   */
  getDownloadUrl: (build?: AppBuild | null): string => {
    if (!build) return "";
    const rawUrl = build.download_url || build.apk_file;
    if (!rawUrl) return "";

    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }

    const backendBase = (
      import.meta.env.VITE_API_URL || "http://localhost:8000/api"
    ).replace(/\/api\/?$/, "");

    return `${backendBase}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
  },
};

export default CoreAPI;
