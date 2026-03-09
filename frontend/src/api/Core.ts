import client from "./client";

export interface AppBuild {
  id: number;
  name: string;
  version: string;
  apk_file: string;
  description: string;
  updated_at: string;
}

const CoreAPI = {
  getLatestBuild: async (): Promise<AppBuild> => {
    const response = await client.get("/core/latest-build/");
    return response.data;
  },
};

export default CoreAPI;
