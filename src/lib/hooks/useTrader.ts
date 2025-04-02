"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TraderProfile, UserPreferences } from "@/core/schemas/trader.schema";

// Local storage key for user preferences
const PREFERENCES_STORAGE_KEY = "flash-stats-preferences";

// Helper to load preferences from localStorage
const loadPreferencesFromStorage = (
  address: string
): Partial<UserPreferences> | null => {
  if (typeof window === "undefined") return null;

  try {
    const savedPrefsString = localStorage.getItem(
      `${PREFERENCES_STORAGE_KEY}-${address}`
    );
    if (!savedPrefsString) return null;

    return JSON.parse(savedPrefsString);
  } catch (error) {
    console.error("Error loading saved preferences:", error);
    return null;
  }
};

// Helper to save preferences to localStorage
const savePreferencesToStorage = (
  address: string,
  preferences: UserPreferences
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${PREFERENCES_STORAGE_KEY}-${address}`,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
};

export function useTraderProfile(address: string) {
  const queryClient = useQueryClient();

  // Load trader profile including what exchanges are available
  const profileQuery = useQuery({
    queryKey: ["trader", address],
    queryFn: async (): Promise<TraderProfile> => {
      if (!address) throw new Error("Address is required");

      // 1. Check which exchanges have data for this trader
      const exchangeResponse = await fetch(
        `/api/wallet-check?address=${address}`
      );
      if (!exchangeResponse.ok) {
        throw new Error(`API error: ${exchangeResponse.status}`);
      }
      const exchangeData = await exchangeResponse.json();
      const availableExchanges = exchangeData.availableExchanges || [];

      // 2. Load saved preferences from localStorage
      const savedPreferences = loadPreferencesFromStorage(address);

      // 3. Create default preferences based on availability
      const defaultPreferences: UserPreferences = {
        exchanges: {
          // Default to showing all available exchanges
          Flash: availableExchanges.includes("Flash"),
          Jupiter: availableExchanges.includes("Jupiter"),
        },
        timeframe: "all",
        theme: "system",
      };

      // 4. Merge saved preferences with defaults (if any saved preferences exist)
      const mergedPreferences: UserPreferences = {
        ...defaultPreferences,
        ...(savedPreferences || {}),
        // Handle the nested exchanges object separately for proper merging
        exchanges: {
          ...defaultPreferences.exchanges,
          ...(savedPreferences?.exchanges || {}),
        },
      };

      // 5. Create and return the trader profile
      return {
        address,
        preferences: mergedPreferences,
        availableExchanges,
        lastUpdated: Date.now(),
      };
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferences>) => {
      if (!address) throw new Error("Address is required");

      // Get current profile
      const currentProfile = queryClient.getQueryData<TraderProfile>([
        "trader",
        address,
      ]);
      if (!currentProfile) throw new Error("Trader profile not found");

      // Merge with new preferences
      const updatedPreferences = {
        ...currentProfile.preferences,
        ...newPreferences,
        // Handle the nested exchanges object separately
        exchanges: {
          ...currentProfile.preferences.exchanges,
          ...(newPreferences.exchanges || {}),
        },
      };

      // Save to localStorage
      savePreferencesToStorage(address, updatedPreferences);

      // Return the updated profile
      return {
        ...currentProfile,
        preferences: updatedPreferences,
        lastUpdated: Date.now(),
      };
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile data
      queryClient.setQueryData(["trader", address], updatedProfile);
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
}
