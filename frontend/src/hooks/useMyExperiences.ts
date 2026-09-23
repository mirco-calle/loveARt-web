import { useState, useEffect } from "react";
import { getUnityTrackingMe, TrackingExperienceData } from "../api/ImageTracking";

export const useMyExperiences = () => {
  const [trackingItems, setTrackingItems] = useState<TrackingExperienceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyData = async () => {
    setIsLoading(true);
    try {
      const trackingRes = await getUnityTrackingMe();
      setTrackingItems(trackingRes.data.results);
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
    isLoading,
    error,
    refresh: fetchMyData,
  };
};
