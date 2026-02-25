import { useState, useRef } from "react";
import Header from "@/components/Header";
import { parseChildrenCSV, parsePetsCSV, ImportType } from "@/lib/csvParser";
import { addChildNames, addPetNames } from "@/lib/namesStore";
import { Upload, FileText, CheckCircle, AlertCircle, Download, Copy, Info } from "lucide-react";
import { toast } from "sonner";

const CHILD_CSV_EXAMPLE = `id,name,gender,origin,culture,religion,meaning,attributes,popularity,namedAfter,famousPeople,history,nameDay,languages
timur,Тимур,male,Тюркское,Татарская,Мусульманское,Железный,сильный;храбрый;лидер,78,Тамерлан,Тимур Бекмамбетов,"Имя происходит от тюркского «темир» — железо. Самый знаменитый носитель — полководец Тамерлан.",11 февраля,tt;ru
gulnara,Гульнара,female,Тюркское,Узбекская,Мусульманское,Цветок граната,красивая;нежная;добрая,65,,,"Тюркское женское имя, состоящее из «гуль» (цветок) и «нар» (гранат).",,uz;tt;ru`;

const PET_CSV_EXAMPLE = `id,name,animalType,origin,meaning,attributes,popularity,namedAfter,famousPets,description,gender
charlie,Чарли,Собака,Английское,Свободный человек,дружелюбный;весёлый;умный,89,,Чарли из фильма «Все псы попадают в рай»,"Популярное английское имя для собак, означающее «свободный человек».",male
cleo,Клео,Кошка,Греческое,Слава,красивая;загадочная;умная,75,,,Краткая форма от Клеопатра. Элегантное имя для кошки.,female`;

const CHILD_FIELDS = [
  { name: "id", required: true, desc: "Уникальный идентификатор (латиницей)", example: "timur" },
  { name: "name", required: true, desc: "Имя", example: "Тимур" },
  { name: "gender", required: true, desc: "Пол: male, female или unisex", example: "male" },
  { name: "origin", required: true, desc: "Происхождение имени", example: "Тюркское" },
  { name: "culture", required: true, desc: "Культура (Русская, Арабская, Татарская...)", example: "Татарская" },
  { name: "religion", required: false, desc: "Религия (Христианское, Мусульманское...)", example: "Мусульманское" },
  { name: "meaning", required: true, desc: "Значение имени", example: "Железный" },
  { name: "attributes", required: true, desc: "Атрибуты через точку с запятой (;)", example: "сильный;храбрый;лидер" },
  { name: "popularity", required: true, desc: "Популярность от 1 до 100", example: "78" },
  { name: "namedAfter", required: false, desc: "В честь кого (через ;)", example: "Тамерлан" },
  { name: "famousPeople", required: false, desc: "Известные люди с этим именем (через ;)", example: "Тимур Бекмамбетов" },
  { name: "history", required: true, desc: "История и описание имени", example: "Имя происходит от тюркского..." },
  { name: "nameDay", required: false, desc: "Дата именин", example: "11 февраля" },
  { name: "languages", required: true, desc: "Языки через точку с запятой", example: "tt;ru" },
];

const PET_FIELDS = [
  { name: "id", required: true, desc: "Уникальный идентификатор (латиницей)", example: "charlie" },
  { name: "name", required: true, desc: "Кличка", example: "Чарли" },
  { name: "animalType", required: true, desc: "Тип животного (Собака, Кошка, Попугай...)", example: "Собака" },
  { name: "origin", required: true, desc: "Происхождение имени", example: "Английское" },
  { name: "meaning", required: true, desc: "Значение имени", example: "Свободный человек" },
  { name: "attributes", required: true, desc: "Атрибуты через точку с запятой (;)", example: "дружелюбный;весёлый;умный" },
  { name: "popularity", required: true, desc: "Популярность от 1 до 100", example: "89" },
  { name: "namedAfter", required: false, desc: "В честь кого (через ;)", example: "" },
  { name: "famousPets", required: false, desc: "Известные питомцы с этим именем (через ;)", example: "Чарли из фильма..." },
  { name: "description", required: true, desc: "Описание имени", example: "Популярное английское имя..." },
  { name: "gender", required: true, desc: "Пол: male, female или unisex", example: "male" },
];

const ImportData = () => {
  const [importType, setImportType] = useState<ImportType>("children");
  const [csvText, setCsvText] = useState("");
  const [results, setResults] = useState<{ added: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fields = importType === "children" ? CHILD_FIELDS : PET_FIELDS;
  const csvExample = importType === "children" ? CHILD_CSV_EXAMPLE : PET_CSV_EXAMPLE;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setResults(null);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = () => {
    if (!csvText.trim()) {
      toast.error("Вставьте CSV данные или загрузите файл");
      return;
    }

    if (importType === "children") {
      const { data, errors } = parseChildrenCSV(csvText);
      if (data.length > 0) {
        const added = addChildNames(data);
        setResults({ added, errors });
        toast.success(`Добавлено ${added} имён для детей`);
      } else {
        setResults({ added: 0, errors: errors.length > 0 ? errors : ["Не удалось распарсить данные"] });
        toast.error("Не удалось импортировать данные");
      }
    } else {
      const { data, errors } = parsePetsCSV(csvText);
      if (data.length > 0) {
        const added = addPetNames(data);
        setResults({ added, errors });
        toast.success(`Добавлено ${added} имён для питомцев`);
      } else {
        setResults({ added: 0, errors: errors.length > 0 ? errors : ["Не удалось распарсить данные"] });
        toast.error("Не удалось импортировать данные");
      }
    }
  };

  const handleCopyExample = () => {
    navigator.clipboard.writeText(csvExample);
    toast.success("Пример скопирован в буфер обмена");
  };

  const handleDownloadExample = () => {
    const blob = new Blob([csvExample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = importType === "children" ? "children_names_example.csv" : "pet_names_example.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadExample = () => {
    setCsvText(csvExample);
    setResults(null);
    toast.info("Пример загружен в текстовое поле");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-light">
            <Upload className="h-5 w-5 text-lavender" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Импорт данных (CSV)</h1>
            <p className="text-sm text-muted-foreground">Добавьте свои имена через CSV файл или текст</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main area */}
          <div className="space-y-6">
            {/* Type selector */}
            <div className="flex gap-2">
              <button
                onClick={() => { setImportType("children"); setResults(null); }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  importType === "children" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                🧒 Имена для детей
              </button>
              <button
                onClick={() => { setImportType("pets"); setResults(null); }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  importType === "pets" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                🐾 Имена для питомцев
              </button>
            </div>

            {/* CSV input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">CSV данные</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <FileText className="h-3 w-3" />
                    Загрузить файл
                  </button>
                  <button
                    onClick={handleLoadExample}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Вставить пример
                  </button>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              <textarea
                value={csvText}
                onChange={(e) => { setCsvText(e.target.value); setResults(null); }}
                placeholder="Вставьте CSV данные сюда или загрузите файл..."
                className="h-48 w-full rounded-xl border border-input bg-background p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleImport}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                Импортировать
              </button>
            </div>

            {/* Results */}
            {results && (
              <div className="animate-fade-in space-y-3 rounded-xl border border-border bg-card p-4">
                {results.added > 0 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Успешно добавлено: {results.added} имён
                  </div>
                )}
                {results.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Ошибки ({results.errors.length}):
                    </div>
                    <ul className="ml-6 space-y-0.5 text-xs text-muted-foreground">
                      {results.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                      {results.errors.length > 10 && (
                        <li>... и ещё {results.errors.length - 10} ошибок</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Example CSV */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Пример CSV</h2>
                <div className="flex gap-2">
                  <button onClick={handleCopyExample} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <Copy className="h-3 w-3" /> Копировать
                  </button>
                  <button onClick={handleDownloadExample} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <Download className="h-3 w-3" /> Скачать .csv
                  </button>
                </div>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-border bg-muted p-3 font-mono text-xs text-foreground">
                {csvExample}
              </pre>
            </div>
          </div>

          {/* Sidebar — field reference */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-lavender" />
                <h2 className="font-display text-sm font-bold text-foreground">
                  Поля {importType === "children" ? "для детей" : "для питомцев"}
                </h2>
              </div>
              <div className="space-y-2.5">
                {fields.map((f) => (
                  <div key={f.name} className="border-b border-border pb-2 last:border-0">
                    <div className="flex items-center gap-1.5">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">{f.name}</code>
                      {f.required ? (
                        <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">обяз.</span>
                      ) : (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">опц.</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">Пример: <code className="text-foreground/80">{f.example}</code></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 font-display text-sm font-bold text-foreground">💡 Советы</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>• Множественные значения разделяйте точкой с запятой (<code className="text-foreground">;</code>)</li>
                <li>• Если текст содержит запятые, оберните его в кавычки (<code className="text-foreground">"текст, с запятой"</code>)</li>
                <li>• Кодировка файла — UTF-8</li>
                <li>• ID должен быть уникальным (латиницей)</li>
                <li>• Популярность — число от 1 до 100</li>
                <li>• Данные добавляются в текущую сессию</li>
                <li>• Дубликаты (по ID) пропускаются</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 font-display text-sm font-bold text-foreground">📊 Доступные атрибуты</h3>
              <div className="flex flex-wrap gap-1">
                {[
                  "сильный", "умный", "красивый", "добрый", "справедливый", "весёлый", "нежная", "мудрый",
                  "храбрый", "лидер", "трудолюбивый", "амбициозный", "здоровый", "верный", "дружелюбный",
                  "игривый", "загадочный", "ловкий", "экзотический", "яркий", "болтливый", "гипнотический",
                  "величественный", "редкий", "элегантный", "спокойный", "энергичный", "независимый",
                  "преданный", "выносливый", "грациозный", "защитник", "целеустремлённый", "талантливый"
                ].map((attr) => (
                  <span key={attr} className="rounded-full bg-rose-light px-2 py-0.5 text-[10px] font-medium text-rose">{attr}</span>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Вы можете использовать любые атрибуты — новые добавятся автоматически</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ImportData;
