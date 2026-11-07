import { getUnityTrackingCatalog, TrackingExperienceData } from "../api/ImageTracking";
import { useAsyncList } from "./useAsyncList";

/**
 * Hook to retrieve public demo tracking experiences for the catalog.
 */
export const usePublicCatalog = () => {
  const { items, isLoading, error, refresh } = useAsyncList<TrackingExperienceData>(
    getUnityTrackingCatalog,
    "No se pudo cargar el catálogo público."
  );

  return {
    trackingItems: items,
    isLoading,
    error,
    refresh,
  };
};
