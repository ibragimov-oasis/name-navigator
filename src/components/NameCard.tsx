import { useState } from "react";
import { Link } from "react-router-dom";
import { ChildName } from "@/data/types";
import { PetName } from "@/data/petNames";
import { Award, ChevronDown, ChevronUp, Crown, Heart, Pen, Star, Users, Volume2 } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import ShareButton from "@/components/ShareButton";
import { speakName, ttsSupported } from "@/lib/tts";

type NameItem = ChildName | PetName;

interface NameCardProps {
  item: NameItem;
  index: number;
}

const NameCard = ({ item, index }: NameCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isChild = "culture" in item;
  const fav = isFavorite(item.id);

  return (
    <div
      className="group animate-fade-in rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-bold text-foreground">{item.name}</h3>
            {item.popularity >= 90 && (
              <Star className="h-4 w-4 fill-gold text-gold" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{item.meaning}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {item.origin}
            </span>
            {isChild && (
              <>
                <span className="rounded-full bg-coral-light px-2 py-0.5 text-xs font-medium text-primary">
                  {(item as ChildName).culture}
                </span>
                {(item as ChildName).religion && (
                  <span className="rounded-full bg-lavender-light px-2 py-0.5 text-xs font-medium text-lavender">
                    {(item as ChildName).religion}
                  </span>
                )}
              </>
            )}
            {!isChild && (
              <span className="rounded-full bg-teal-light px-2 py-0.5 text-xs font-medium text-accent">
                {(item as PetName).animalType}
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              item.gender === "male" ? "bg-blue-50 text-blue-600" :
              item.gender === "female" ? "bg-pink-50 text-pink-600" :
              "bg-secondary text-secondary-foreground"
            }`}>
              {item.gender === "male" ? "♂ Муж" : item.gender === "female" ? "♀ Жен" : "⚥ Унисекс"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(item.id)}
              className="rounded-lg p-1 transition-colors hover:bg-rose-light"
              title={fav ? "Убрать из избранного" : "В избранное"}
            >
              <Heart className={`h-4 w-4 transition-colors ${fav ? "fill-rose text-rose" : "text-muted-foreground"}`} />
            </button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Crown className="h-3 w-3" />
              {item.popularity}%
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 animate-fade-in space-y-3 border-t border-border pt-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">История</h4>
            <p className="mt-1 text-sm text-foreground leading-relaxed">
              {isChild ? (item as ChildName).history : (item as PetName).description}
            </p>
          </div>

          {item.attributes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Атрибуты</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.attributes.map((attr) => (
                  <span key={attr} className="rounded-full bg-rose-light px-2 py-0.5 text-xs font-medium text-rose">
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {"famousPeople" in item && item.famousPeople && item.famousPeople.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Users className="h-3 w-3" /> Известные люди
              </h4>
              <ul className="mt-1 space-y-0.5">
                {item.famousPeople.map((person: string) => (
                  <li key={person} className="text-sm text-foreground">• {person}</li>
                ))}
              </ul>
            </div>
          )}

          {"famousPets" in item && (item as PetName).famousPets && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Известные питомцы</h4>
              <ul className="mt-1 space-y-0.5">
                {(item as PetName).famousPets!.map((pet) => (
                  <li key={pet} className="text-sm text-foreground">• {pet}</li>
                ))}
              </ul>
            </div>
          )}

          {isChild && (item as ChildName).namedAfter && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Названо в честь</h4>
              <ul className="mt-1 space-y-0.5">
                {(item as ChildName).namedAfter!.map((n) => (
                  <li key={n} className="text-sm text-foreground">• {n}</li>
                ))}
              </ul>
            </div>
          )}

          {isChild && (item as ChildName).nameDay && (
            <p className="text-sm text-muted-foreground">
              📅 Именины: <span className="font-medium text-foreground">{(item as ChildName).nameDay}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/signature?name=${encodeURIComponent(item.name)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Pen className="h-3 w-3" /> Подпись
            </Link>
            <Link
              to={`/certificate?name=${encodeURIComponent(item.name)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Award className="h-3 w-3" /> Сертификат
            </Link>
            {ttsSupported() && (
              <button
                onClick={() => speakName(item.name)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                title="Произнести"
              >
                <Volume2 className="h-3 w-3" /> Озвучить
              </button>
            )}
            <ShareButton
              title={`${item.name} — значение и происхождение`}
              text={item.meaning}
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/?name=${encodeURIComponent(item.name)}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NameCard;
