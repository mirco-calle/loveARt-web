import { useState, useEffect } from "react";
import { getUnityTrackingMe, TrackingExperienceData } from "../api/ImageTracking";
import { getUnityArchitectureMe, ArchitectureExperienceData } from "../api/ArchitectureAr";

export const useMyExperiences = () => {
  const [trackingItems, setTrackingItems] = useState<TrackingExperienceData[]>([]);
  const [architectureItems, setArchitectureItems] = useState<ArchitectureExperienceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyData = async () => {
    setIsLoading(true);
    try {
      const [trackingRes, architectureRes] = await Promise.all([
        getUnityTrackingMe(),
        getUnityArchitectureMe(),
      ]);
      setTrackingItems(trackingRes.data.results);
      setArchitectureItems(architectureRes.data.results);
      setError(null);
    } catch (err) {
      console.error("Error fetching my experiences:", err);
      setError("No se pudo cargar tus experiencias.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  return {
    trackingItems,
    architectureItems,
    isLoading,
    error,
    refresh: fetchMyData,
  };
};
