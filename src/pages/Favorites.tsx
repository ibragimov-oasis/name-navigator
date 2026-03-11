import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import NameCard from "@/components/NameCard";
import { useFavorites, getRecommendations } from "@/lib/favorites";
import { getChildNames } from "@/lib/namesStore";
import { getPetNames } from "@/lib/namesStore";
import { Heart, Sparkles, Trash2 } from "lucide-react";

const Favorites = () => {
  const { favorites, clearFavorites } = useFavorites();
  const [tab, setTab] = useState<"favorites" | "recommendations">("favorites");

  const allChildNames = useMemo(() => getChildNames(), []);
  const allPetNames = useMemo(() => getPetNames(), []);
  const allNames = useMemo(() => [...allChildNames, ...allPetNames], [allChildNames, allPetNames]);

  const favoriteNames = useMemo(
    () => allNames.filter((n) => favorites.includes(n.id)),
    [allNames, favorites]
  );

  const recommendations = useMemo(
    () => getRecommendations(allNames, favorites, 12),
    [allNames, favorites]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-light">
              <Heart className="h-5 w-5 text-rose" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Избранное</h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? "имя" : favorites.length < 5 ? "имени" : "имён"} сохранено
              </p>
            </div>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Очистить
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-1">
          <button
            onClick={() => setTab("favorites")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "favorites"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="mr-1.5 inline h-4 w-4" />
            Избранные ({favoriteNames.length})
          </button>
          <button
            onClick={() => setTab("recommendations")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "recommendations"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="mr-1.5 inline h-4 w-4" />
            Рекомендации ({recommendations.length})
          </button>
        </div>

        {tab === "favorites" && (
          <>
            {favoriteNames.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Heart className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-foreground">Нет избранных имён</p>
                <p className="text-sm text-muted-foreground">
                  Нажмите ♥ на карточке имени, чтобы добавить в избранное
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favoriteNames.map((name, i) => (
                  <NameCard key={name.id} item={name} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "recommendations" && (
          <>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Sparkles className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-foreground">Добавьте имена в избранное</p>
                <p className="text-sm text-muted-foreground">
                  Мы подберём похожие имена на основе ваших предпочтений
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Sparkles className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-foreground">Не удалось найти рекомендации</p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  На основе ваших избранных имён — схожие атрибуты, культура и происхождение
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendations.map((name, i) => (
                    <NameCard key={name.id} item={name} index={i} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Favorites;
