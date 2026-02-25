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
