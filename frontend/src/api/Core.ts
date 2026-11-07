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
   * Prioritizes the streaming endpoint (/api/core/download-latest-apk/)
   * ensuring Android devices get an attachment download with proper headers.
   */
  getDownloadUrl: (build?: AppBuild | null): string => {
    if (!build) return "";

    const backendBase = (
      import.meta.env.VITE_API_URL || "http://localhost:8000/api"
    ).replace(/\/api\/?$/, "");

    // 1. Si el backend envió una URL absoluta directa de descarga
    if (build.download_url) {
      if (build.download_url.startsWith("http://") || build.download_url.startsWith("https://")) {
        return build.download_url;
      }
      return `${backendBase}${build.download_url.startsWith("/") ? "" : "/"}${build.download_url}`;
    }

    // 2. Endpoint dedicado de streaming de la última build
    return `${backendBase}/api/core/download-latest-apk/`;
  },
};

export default CoreAPI;
