import api from "./client";

// ============================================
// ARCHITECTURE AR API
// ============================================

export interface Blueprint {
  id: number;
  title: string;
  description: string;
  image_url: string;
  file_size?: number;
  width?: number;
  height?: number;
  original_format?: string;
  is_active: boolean;
  is_public: boolean;
  model3d: Model3D | null;
  created_at: string;
}

export interface Model3D {
  id: number;
  title: string;
  file_url: string;
  scale: number;
  file_size?: number;
}

export interface ArchitectureExperienceData {
  id: number;
  name: string;
  title: string;
  description: string;
  image_url: string;
  model3d_url: string | null;
  model3d_scale: number;
  model_url: string | null;
  pdf_url: string | null;
  preview_image_url: string;
  resolution: string | null;
  image_size: number;
  model_size: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** List all blueprints for the authenticated user */
export const getBlueprints = () =>
  api.get<{ results: Blueprint[] }>("/architecture/blueprints/");

/** Create a new blueprint */
export const createBlueprint = (formData: FormData) =>
  api.post("/architecture/blueprints/create/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Upload 3D model for a blueprint */
export const uploadModel3D = (blueprintId: number, formData: FormData) =>
  api.post(`/architecture/blueprints/${blueprintId}/model3d/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Delete a blueprint */
export const deleteBlueprint = (blueprintId: number) =>
  api.delete(`/architecture/blueprints/${blueprintId}/delete/`);

/** Delete 3D model for a blueprint */
export const deleteModel3D = (blueprintId: number) =>
  api.delete(`/architecture/blueprints/${blueprintId}/model3d/delete/`);

// --- Unity Experience Endpoints ---

/** Get user's architecture experiences (Unity Format) */
export const getUnityArchitectureMe = () =>
  api.get<{ count: number; results: ArchitectureExperienceData[] }>("/architecture/unity/me/");

/** Get public architecture catalog (Unity Format) */
export const getUnityArchitectureCatalog = () =>
  api.get<{ count: number; results: ArchitectureExperienceData[] }>("/architecture/unity/catalog/");
