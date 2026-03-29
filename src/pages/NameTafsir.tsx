import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getChildNames } from "@/lib/namesStore";
import { transliterateToArabic } from "@/lib/arabicTranslit";
import { calculateNumerology, DESTINY_TRAITS } from "@/lib/numerology";
import { fetchAyahWithArabic } from "@/lib/api/quranApi";
import { BookOpen, Search, Star, Moon, Globe } from "lucide-react";

// Quranic references for popular Islamic names
const QURAN_REFS: Record<string, { sura: string; ayat: string; text: string }[]> = {
  "ибрахим": [{ sura: "Ибрахим (14)", ayat: "35", text: "Вот сказал Ибрахим: «Господи! Сделай этот город безопасным»" }],
  "марьям": [{ sura: "Марьям (19)", ayat: "16", text: "Помяни в Писании Марьям. Вот она удалилась от своей семьи на восток" }],
  "юсуф": [{ sura: "Юсуф (12)", ayat: "4", text: "Вот сказал Юсуф отцу: «О мой отец! Я видел одиннадцать звёзд»" }],
  "муса": [{ sura: "Та Ха (20)", ayat: "11-12", text: "Когда он подошёл к огню, раздался глас: «О Муса! Воистину, Я — твой Господь»" }],
  "иса": [{ sura: "Аль Имран (3)", ayat: "45", text: "Вот сказали ангелы: «О Марьям! Аллах радует тебя вестью о слове от Него, имя которому — Масих Иса»" }],
  "мухаммад": [{ sura: "Мухаммад (47)", ayat: "2", text: "А тем, которые уверовали, совершали праведные деяния и уверовали в то, что ниспослано Мухаммаду — а это есть истина от их Господа — Он простит прегрешения" }],
  "нух": [{ sura: "Нух (71)", ayat: "1", text: "Мы отправили Нуха к его народу: «Предостерегай свой народ прежде, чем постигнет их мучительное наказание»" }],
  "дауд": [{ sura: "Сад (38)", ayat: "17", text: "Стерпи же то, что они говорят, и помяни Нашего раба Дауда, обладавшего мощью" }],
  "сулейман": [{ sura: "Ан-Намль (27)", ayat: "16", text: "Сулейман наследовал Дауду и сказал: «О люди! Нас научили языку птиц»" }],
  "аюб": [{ sura: "Аль-Анбия (21)", ayat: "83", text: "Помяни Аюба. Вот он воззвал к своему Господу: «Меня постигла беда, а ведь Ты — Милосерднейший из милосердных»" }],
  "юнус": [{ sura: "Аль-Анбия (21)", ayat: "87", text: "Помяни Зуннуна (Юнуса). Вот он ушёл в гневе и подумал, что Мы не справимся с ним" }],
  "яхья": [{ sura: "Марьям (19)", ayat: "12", text: "«О Яхья! Крепко держись Писания». И Мы даровали ему мудрость ещё ребёнком" }],
  "адам": [{ sura: "Аль-Бакара (2)", ayat: "31", text: "Он научил Адама всевозможным именам, а затем представил их ангелам" }],
  "закария": [{ sura: "Марьям (19)", ayat: "2-3", text: "Это — повествование о милости твоего Господа к Его рабу Закарии. Вот он воззвал к Господу тихим голосом" }],
  "идрис": [{ sura: "Марьям (19)", ayat: "56-57", text: "Помяни в Писании Идриса. Воистину, он был правдивым, пророком. Мы вознесли его на высокое место" }],
  "салих": [{ sura: "Аль-Араф (7)", ayat: "73", text: "К самудянам — их брата Салиха. Он сказал: «О мой народ! Поклоняйтесь Аллаху»" }],
  "худ": [{ sura: "Худ (11)", ayat: "50", text: "К адитам — их брата Худа. Он сказал: «О мой народ! Поклоняйтесь Аллаху. Нет у вас другого божества»" }],
  "исмаил": [{ sura: "Марьям (19)", ayat: "54", text: "Помяни в Писании Исмаила. Воистину, он был правдив в обещании и был посланником, пророком" }],
  "нур": [{ sura: "Ан-Нур (24)", ayat: "35", text: "Аллах — Свет небес и земли" }],
  "рахман": [{ sura: "Ар-Рахман (55)", ayat: "1-2", text: "Милостивый научил Корану" }],
  "амина": [{ sura: "Аль-Касас (28)", ayat: "7", text: "Мы внушили матери Мусы: «Корми его грудью»" }],
  "хасан": [{ sura: "Аль-Бакара (2)", ayat: "201", text: "Господь наш! Даруй нам в этом мире добро (хасана) и в Последней жизни добро" }],
};

const HADITH_REFS: Record<string, string[]> = {
  "мухаммад": [
    "«Самые любимые имена перед Аллахом — Абдуллах и Абдуррахман» (Муслим)",
    "«Называйте моим именем, но не давайте мою кунью» (Бухари)",
  ],
  "абдуллах": ["«Самые любимые имена перед Аллахом — Абдуллах и Абдуррахман» (Муслим)"],
  "абдуррахман": ["«Самые любимые имена перед Аллахом — Абдуллах и Абдуррахман» (Муслим)"],
  "хасан": ["Пророк ﷺ сказал: «Я назвал его Хасаном» — когда родился внук (Ахмад)"],
  "хусейн": ["Пророк ﷺ назвал внука Хусейном и совершил за него акику (Тирмизи)"],
};

const NameTafsir = () => {
  const [search, setSearch] = useState("");
  const allNames = getChildNames();

  const islamicNames = useMemo(() =>
    allNames.filter(n => n.religion === "Мусульманское" || n.culture === "Арабская"),
    [allNames]
  );

  const selectedName = useMemo(() => {
    if (!search.trim()) return null;
    const lower = search.toLowerCase().trim();
    return islamicNames.find(n => n.name.toLowerCase() === lower) || null;
  }, [search, islamicNames]);

  const suggestions = useMemo(() => {
    if (!search.trim() || selectedName) return [];
    const lower = search.toLowerCase().trim();
    return islamicNames
      .filter(n => n.name.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [search, selectedName, islamicNames]);

  const quranRefs = selectedName ? QURAN_REFS[selectedName.name.toLowerCase()] : null;
  const hadithRefs = selectedName ? HADITH_REFS[selectedName.name.toLowerCase()] : null;
  const arabicText = selectedName ? transliterateToArabic(selectedName.name) : "";
  const numerology = selectedName ? calculateNumerology(selectedName.name) : null;
  const destinyInfo = numerology ? DESTINY_TRAITS[numerology.destinyNumber] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Тафсир имени</h1>
          <p className="mt-2 text-muted-foreground">Глубокий анализ мусульманского имени: Коран, хадисы, значение</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Введите имя (например, Мухаммад, Марьям, Юсуф)..."
            className="pl-10 text-lg h-12"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card shadow-lg">
              {suggestions.map(n => (
                <button key={n.id} onClick={() => setSearch(n.name)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl">
                  <span className="font-semibold text-foreground">{n.name}</span>
                  <span className="text-xs text-muted-foreground">{n.meaning}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedName && (
          <div className="space-y-6 animate-fade-in">
            {/* Arabic rendering */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8 text-center">
              <p className="text-5xl font-bold mb-3" style={{ fontFamily: '"Noto Naskh Arabic", serif', direction: "rtl" }}>
                {arabicText}
              </p>
              <h2 className="font-display text-3xl font-bold text-foreground">{selectedName.name}</h2>
              <p className="mt-1 text-lg text-muted-foreground">{selectedName.meaning}</p>
              <div className="mt-3 flex justify-center gap-2 flex-wrap">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{selectedName.origin}</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{selectedName.gender === "male" ? "♂ Мужское" : selectedName.gender === "female" ? "♀ Женское" : "⚥ Унисекс"}</span>
              </div>
            </div>

            {/* Quranic references */}
            {quranRefs && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
                  <Moon className="h-5 w-5 text-primary" /> Упоминание в Коране
                </h3>
                <div className="space-y-3">
                  {quranRefs.map((ref, i) => (
                    <div key={i} className="rounded-lg bg-secondary/50 p-4">
                      <p className="text-sm italic text-foreground">«{ref.text}»</p>
                      <p className="mt-2 text-xs font-semibold text-primary">Сура {ref.sura}, аят {ref.ayat}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hadith references */}
            {hadithRefs && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
                  <Star className="h-5 w-5 text-gold" /> Упоминание в хадисах
                </h3>
                <div className="space-y-3">
                  {hadithRefs.map((h, i) => (
                    <div key={i} className="rounded-lg bg-gold/5 p-4">
                      <p className="text-sm text-foreground">{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">📖 История и значение</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedName.history}</p>
            </div>

            {/* Numerology */}
            {numerology && destinyInfo && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">🔢 Нумерология имени</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary/50 p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{numerology.destinyNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">Число судьбы</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4 text-center">
                    <p className="text-lg font-bold text-foreground">{destinyInfo.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{destinyInfo.element} • {destinyInfo.planet}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {destinyInfo.traits.map(t => (
                    <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">✨ Качества имени</h3>
              <div className="flex flex-wrap gap-2">
                {selectedName.attributes.map(a => (
                  <span key={a} className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">{a}</span>
                ))}
              </div>
            </div>

            {/* Famous people */}
            {selectedName.famousPeople && selectedName.famousPeople.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">👤 Известные носители имени</h3>
                <ul className="space-y-1">
                  {selectedName.famousPeople.map((p, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!selectedName && !search && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Введите мусульманское имя для глубокого анализа</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Мухаммад", "Марьям", "Юсуф", "Аиша", "Ибрахим", "Фатима"].map(n => (
                <button key={n} onClick={() => setSearch(n)}
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/10 transition-colors">
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameTafsir;
