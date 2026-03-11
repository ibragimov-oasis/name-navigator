import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ChildName } from "@/data/types";
import { PetName } from "@/data/petNames";

type NameItem = ChildName | PetName;

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = "imyagen-favorites";

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};

/**
 * Recommendation algorithm:
 * Analyzes favorited names to find patterns in attributes, culture, gender, origin.
 * Scores unfavorited names by how well they match these patterns.
 */
export function getRecommendations(
  allNames: NameItem[],
  favoriteIds: string[],
  limit = 10
): NameItem[] {
  if (favoriteIds.length === 0) return [];

  const favNames = allNames.filter((n) => favoriteIds.includes(n.id));
  if (favNames.length === 0) return [];

  // Build frequency maps
  const attrFreq: Record<string, number> = {};
  const genderFreq: Record<string, number> = {};
  const originFreq: Record<string, number> = {};
  const cultureFreq: Record<string, number> = {};

  for (const name of favNames) {
    for (const attr of name.attributes) {
      attrFreq[attr] = (attrFreq[attr] || 0) + 1;
    }
    genderFreq[name.gender] = (genderFreq[name.gender] || 0) + 1;
    originFreq[name.origin] = (originFreq[name.origin] || 0) + 1;
    if ("culture" in name) {
      const c = (name as ChildName).culture;
      cultureFreq[c] = (cultureFreq[c] || 0) + 1;
    }
  }

  const total = favNames.length;

  // Score each non-favorite name
  const candidates = allNames.filter((n) => !favoriteIds.includes(n.id));

  const scored = candidates.map((name) => {
    let score = 0;

    // Attribute overlap (strongest signal, up to 50 points)
    const matchedAttrs = name.attributes.filter((a) => attrFreq[a]);
    if (matchedAttrs.length > 0) {
      const attrScore = matchedAttrs.reduce((sum, a) => sum + (attrFreq[a] / total), 0);
      score += Math.min(attrScore * 10, 50);
    }

    // Gender match (up to 20 points)
    if (genderFreq[name.gender]) {
      score += (genderFreq[name.gender] / total) * 20;
    }

    // Origin match (up to 15 points)
    if (originFreq[name.origin]) {
      score += (originFreq[name.origin] / total) * 15;
    }

    // Culture match (up to 15 points)
    if ("culture" in name) {
      const c = (name as ChildName).culture;
      if (cultureFreq[c]) {
        score += (cultureFreq[c] / total) * 15;
      }
    }

    // Popularity bonus (minor, up to 5 points)
    score += (name.popularity / 100) * 5;

    return { name, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.name);
}
