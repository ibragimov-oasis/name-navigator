import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getChildNames } from "@/lib/namesStore";
import { ChildName } from "@/data/childNames";
import { Swords, Trophy, RotateCcw, Crown, Zap } from "lucide-react";

const NameBattle = () => {
  const allNames = getChildNames();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [round, setRound] = useState(0);
  const [winners, setWinners] = useState<ChildName[]>([]);
  const [champion, setChampion] = useState<ChildName | null>(null);
  const [started, setStarted] = useState(false);

  const pool = useMemo(() => {
    const filtered = allNames.filter(n => n.gender === gender || n.gender === "unisex");
    // Shuffle & pick 8
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [allNames, gender, started]); // eslint-disable-line

  const [contestants, setContestants] = useState<ChildName[]>([]);
  const [pairIndex, setPairIndex] = useState(0);

  const startBattle = () => {
    setContestants([...pool]);
    setWinners([]);
    setChampion(null);
    setRound(1);
    setPairIndex(0);
    setStarted(true);
  };

  const currentPair = useMemo(() => {
    if (contestants.length < 2) return null;
    const i = pairIndex * 2;
    if (i + 1 >= contestants.length) return null;
    return [contestants[i], contestants[i + 1]] as [ChildName, ChildName];
  }, [contestants, pairIndex]);

  const totalPairs = Math.floor(contestants.length / 2);

  const pickWinner = useCallback((winner: ChildName) => {
    const newWinners = [...winners, winner];

    if (pairIndex + 1 < totalPairs) {
      // More pairs in this round
      setPairIndex(pairIndex + 1);
      setWinners(newWinners);
    } else {
      // Round complete
      if (newWinners.length === 1) {
        setChampion(newWinners[0]);
      } else {
        setContestants(newWinners);
        setWinners([]);
        setPairIndex(0);
        setRound(r => r + 1);
      }
    }
  }, [winners, pairIndex, totalPairs]);

  const roundLabel = contestants.length <= 2 ? "Финал" :
    contestants.length <= 4 ? "Полуфинал" :
    `Раунд ${round}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">

        {!started && !champion && (
          <div className="animate-fade-in space-y-6 text-center">
            <Swords className="mx-auto h-14 w-14 text-primary" />
            <h1 className="font-display text-4xl font-bold text-foreground">Битва имён</h1>
            <p className="text-muted-foreground">
              8 имён сразятся попарно. Выбирай лучшее — и найди чемпиона!
            </p>
            <div className="mx-auto flex max-w-xs gap-3">
              <button onClick={() => setGender("male")}
                className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                  gender === "male" ? "border-primary bg-coral-light text-primary" : "border-border text-muted-foreground"
                }`}>♂ Мальчики</button>
              <button onClick={() => setGender("female")}
                className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                  gender === "female" ? "border-rose bg-rose-light text-rose" : "border-border text-muted-foreground"
                }`}>♀ Девочки</button>
            </div>
            <Button onClick={startBattle} size="lg" className="mt-4">
              <Zap className="mr-2 h-5 w-5" /> Начать битву
            </Button>
          </div>
        )}

        {started && !champion && currentPair && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-muted-foreground">{roundLabel} • Пара {pairIndex + 1}/{totalPairs}</p>
              <h1 className="font-display text-2xl font-bold text-foreground mt-1">Выбери лучшее имя</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentPair.map((name, i) => (
                <button
                  key={name.id}
                  onClick={() => pickWinner(name)}
                  className="group rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 active:scale-95"
                >
                  <div className="text-center">
                    <span className="text-3xl">{i === 0 ? "🔵" : "🔴"}</span>
                    <h2 className="mt-3 font-display text-2xl font-bold text-foreground">{name.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{name.meaning}</p>
                    <div className="mt-3 space-y-1">
                      <span className="rounded-full bg-coral-light px-2 py-0.5 text-xs font-medium text-primary">{name.culture}</span>
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {name.attributes.slice(0, 3).map(a => (
                          <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">{a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Crown className="h-3 w-3" /> Популярность: {name.popularity}%
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">Нажми на карточку с именем, которое тебе нравится больше</p>
          </div>
        )}

        {champion && (
          <div className="animate-fade-in space-y-6 text-center">
            <Trophy className="mx-auto h-16 w-16 text-gold" />
            <h1 className="font-display text-4xl font-bold text-foreground">Чемпион!</h1>
            <div className="mx-auto max-w-sm rounded-2xl border-2 border-gold bg-card p-8 shadow-lg">
              <h2 className="font-display text-4xl font-black text-primary">{champion.name}</h2>
              <p className="mt-2 text-lg text-muted-foreground">{champion.meaning}</p>
              <p className="mt-3 text-sm text-foreground">{champion.history}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-1">
                {champion.attributes.map(a => (
                  <span key={a} className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">{a}</span>
                ))}
              </div>
              {champion.famousPeople && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <p className="font-semibold">Известные люди:</p>
                  {champion.famousPeople.map(p => <p key={p}>• {p}</p>)}
                </div>
              )}
            </div>
            <Button onClick={() => { setStarted(false); setChampion(null); }} variant="outline" size="lg">
              <RotateCcw className="mr-2 h-4 w-4" /> Новая битва
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameBattle;
