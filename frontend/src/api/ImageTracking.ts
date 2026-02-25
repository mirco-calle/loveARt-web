import api from "./client";

// ============================================
// IMAGE TRACKING API
// ============================================

export interface TrackingImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  aspect_ratio: "16:9" | "9:16";
  file_size?: number;
  width?: number;
  height?: number;
  is_active: boolean;
  is_public: boolean;
  video: TrackingVideo | null;
  created_at: string;
}

export interface TrackingVideo {
  id: number;
  title: string;
  video_url: string;
  file_size?: number;
}

/** List all tracking images for the authenticated user */
export const getTrackingImages = () =>
  api.get<{ results: TrackingImage[] }>("/tracking/images/");

/** Create a new tracking image */
export const createTrackingImage = (formData: FormData) =>
  api.post("/tracking/images/create/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Upload video for a tracking image */
export const uploadTrackingVideo = (imageId: number, formData: FormData) =>
  api.post(`/tracking/images/${imageId}/video/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Delete a tracking image */
export const deleteTrackingImage = (imageId: number) =>
  api.delete(`/tracking/images/${imageId}/delete/`);

/** Delete video for a tracking image */
export const deleteTrackingVideo = (imageId: number) =>
  api.delete(`/tracking/images/${imageId}/video/delete/`);
