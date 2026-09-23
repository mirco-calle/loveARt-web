import { useState, useEffect } from "react";
import { getUnityTrackingCatalog, TrackingExperienceData } from "../api/ImageTracking";

export const usePublicCatalog = () => {
  const [trackingItems, setTrackingItems] = useState<TrackingExperienceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const trackingRes = await getUnityTrackingCatalog();
      setTrackingItems(trackingRes.data.results);
      setError(null);
    } catch (err) {
      console.error("Error fetching public catalog:", err);
      setError("No se pudo cargar el catálogo público.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  return {
    trackingItems,
    isLoading,
    error,
    refresh: fetchCatalog,
  };
};
