import { useState, useEffect } from "react";
import { getUnityTrackingCatalog, TrackingExperienceData } from "../api/ImageTracking";
import { getUnityArchitectureCatalog, ArchitectureExperienceData } from "../api/ArchitectureAr";

export const usePublicCatalog = () => {
  const [trackingItems, setTrackingItems] = useState<TrackingExperienceData[]>([]);
  const [architectureItems, setArchitectureItems] = useState<ArchitectureExperienceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const [trackingRes, architectureRes] = await Promise.all([
        getUnityTrackingCatalog(),
        getUnityArchitectureCatalog(),
      ]);
      setTrackingItems(trackingRes.data.results);
      setArchitectureItems(architectureRes.data.results);
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
    architectureItems,
    isLoading,
    error,
    refresh: fetchCatalog,
  };
};
