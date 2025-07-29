/**
 * useFavorites Hook
 * 
 * This custom hook provides global state management for favorite icons.
 * It handles localStorage persistence and provides methods to add/remove favorites.
 * 
 * Features:
 * - Persistent storage using localStorage
 * - Add/remove favorites functionality
 * - Check if an icon is favorited
 * - Get all favorite icons data
 * - Automatic state synchronization across components
 */

import { useState, useEffect, useCallback } from 'react';
import type { IconData } from '@/types';

// Types for the hook
interface UseFavoritesReturn {
  favorites: Set<string>;
  favoriteIcons: IconData[];
  addFavorite: (icon: IconData) => void;
  removeFavorite: (iconId: string) => void;
  toggleFavorite: (icon: IconData) => void;
  isFavorite: (iconId: string) => boolean;
  getFavoriteCount: () => number;
}

/**
 * Custom hook for managing favorite icons
 * 
 * @returns Object containing favorites state and manipulation functions
 */
export const useFavorites = (): UseFavoritesReturn => {
  // State for storing favorite icon IDs
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // State for storing complete icon data for favorites
  const [favoriteIcons, setFavoriteIcons] = useState<IconData[]>([]);

  /**
   * Load favorites from localStorage on hook initialization
   */
  useEffect(() => {
    try {
      // Load favorite IDs from localStorage
      const savedFavorites = localStorage.getItem('iconFavorites');
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavorites(new Set(favoriteIds));
      }

      // Load favorite icons data from localStorage
      const savedIconsData = localStorage.getItem('favoriteIconsData');
      if (savedIconsData) {
        const iconsData = JSON.parse(savedIconsData);
        setFavoriteIcons(iconsData);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  /**
   * Save favorites to localStorage whenever favorites state changes
   */
  const saveFavoritesToStorage = useCallback((newFavorites: Set<string>, newIconsData: IconData[]) => {
    try {
      localStorage.setItem('iconFavorites', JSON.stringify([...newFavorites]));
      localStorage.setItem('favoriteIconsData', JSON.stringify(newIconsData));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, []);

  /**
   * Add an icon to favorites
   * 
   * @param icon - The complete icon data to add to favorites
   */
  const addFavorite = useCallback((icon: IconData) => {
    const iconId = icon.id?.toString();
    if (!iconId) return;

    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (!newFavorites.has(iconId)) {
        newFavorites.add(iconId);
        
        // Update icons data array
        setFavoriteIcons(prevIcons => {
          const updatedIcons = [...prevIcons, icon];
          // Save to localStorage
          saveFavoritesToStorage(newFavorites, updatedIcons);
          return updatedIcons;
        });
      }
      return newFavorites;
    });
  }, [saveFavoritesToStorage]);

  /**
   * Remove an icon from favorites
   * 
   * @param iconId - The ID of the icon to remove from favorites
   */
  const removeFavorite = useCallback((iconId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(iconId)) {
        newFavorites.delete(iconId);
        
        // Update icons data array
        setFavoriteIcons(prevIcons => {
          const updatedIcons = prevIcons.filter(icon => icon.id?.toString() !== iconId);
          // Save to localStorage
          saveFavoritesToStorage(newFavorites, updatedIcons);
          return updatedIcons;
        });
      }
      return newFavorites;
    });
  }, [saveFavoritesToStorage]);

  /**
   * Toggle favorite status for an icon
   * Adds to favorites if not present, removes if present
   * 
   * @param icon - The complete icon data to toggle
   */
  const toggleFavorite = useCallback((icon: IconData) => {
    const iconId = icon.id?.toString();
    if (!iconId) return;

    if (favorites.has(iconId)) {
      removeFavorite(iconId);
    } else {
      addFavorite(icon);
    }
  }, [favorites, addFavorite, removeFavorite]);

  /**
   * Check if an icon is in favorites
   * 
   * @param iconId - The ID of the icon to check
   * @returns boolean indicating if the icon is favorited
   */
  const isFavorite = useCallback((iconId: string) => {
    return favorites.has(iconId);
  }, [favorites]);

  /**
   * Get the total count of favorite icons
   * 
   * @returns Number of favorite icons
   */
  const getFavoriteCount = useCallback(() => {
    return favorites.size;
  }, [favorites]);

  return {
    favorites,
    favoriteIcons,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
  };
};

export default useFavorites;