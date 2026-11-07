import { getUnityTrackingMe, TrackingExperienceData } from "../api/ImageTracking";
import { useAsyncList } from "./useAsyncList";

/**
 * Hook to retrieve tracking experiences belonging to the authenticated user.
 */
export const useMyExperiences = () => {
  const { items, isLoading, error, refresh } = useAsyncList<TrackingExperienceData>(
    getUnityTrackingMe,
    "No se pudo cargar tus experiencias."
  );

  return {
    trackingItems: items,
    isLoading,
    error,
    refresh,
  };
};
