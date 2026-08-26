/**
 * Web Speech TTS helper with support for English (Latin/Romanization), Persian (Farsi),
 * Arabic, Russian, and System Voices.
 * Optimized for reading Tajik National Registry names with custom voices, speed (down to 0.25x),
 * volume, and playback modes.
 */
import { TajikRegistryName } from "@/data/tajikTypes";

export interface SpeechVoiceCategory {
  id: string;
  name: string;
  lang: string;
  flag: string;
  voices: SpeechSynthesisVoice[];
}

export type VoicePreset = "english" | "auto" | "persian" | "arabic" | "russian" | "system";

export type SpeechReadingMode = "name_only" | "name_meaning" | "full";

export interface SpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  voicePreset?: VoicePreset;
  rate?: number; // 0.25 - 2.0
  pitch?: number; // 0.5 - 1.5
  volume?: number; // 0.0 - 1.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (e: SpeechSynthesisErrorEvent | unknown) => void;
}

// Simple Cyrillic-to-Latin phonetic converter for voice compatibility
export function cyrillicToPhoneticLatin(text: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", ғ: "gh", д: "d", е: "e", ё: "yo",
    ж: "zh", з: "z", и: "i", ӣ: "ee", й: "y", к: "k", қ: "q", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ӯ: "oo", ф: "f", х: "kh", ҳ: "h", ч: "ch", ҷ: "j", ш: "sh", ъ: "'",
    э: "e", ю: "yu", я: "ya",
    А: "A", Б: "B", В: "V", Г: "G", Ғ: "Gh", Д: "D", Е: "E", Ё: "Yo",
    Ж: "Zh", З: "Z", И: "I", Ӣ: "Ee", Й: "Y", К: "K", Қ: "Q", Л: "L",
    М: "M", Н: "N", О: "O", П: "P", Р: "R", С: "S", Т: "T", У: "U",
    Ӯ: "Oo", Ф: "F", Х: "Kh", Ҳ: "H", Ч: "Ch", Ҷ: "J", Ш: "Sh", Ъ: "'",
    Э: "E", Ю: "Yu", Я: "Ya"
  };

  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
}

// Check if TTS is supported in the current browser
export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Get all system voices with retry/event caching
export function getSystemVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!ttsSupported()) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;
    let voices = synth.getVoices();

    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const onVoices = () => {
      voices = synth.getVoices();
      synth.removeEventListener("voiceschanged", onVoices);
      resolve(voices);
    };

    synth.addEventListener("voiceschanged", onVoices);

    // Fallback if event doesn't fire
    setTimeout(() => {
      resolve(synth.getVoices());
    }, 300);
  });
}

// Find best voice according to preset
export function resolveBestVoice(
  voices: SpeechSynthesisVoice[],
  preset: VoicePreset,
  customVoiceUri?: string
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  // 1. If a specific URI is chosen
  if (customVoiceUri && customVoiceUri !== "auto") {
    const found = voices.find((v) => v.voiceURI === customVoiceUri || v.name === customVoiceUri);
    if (found) return found;
  }

  // 2. English / Latin preset (Recommended for 100% letter articulation without skipping)
  if (preset === "english") {
    // Look for top English voices: Samantha, Daniel, Google US English, Alex, Karen, Siri
    const preferredNames = ["Samantha", "Daniel", "Google US English", "Alex", "Karen", "Victoria", "Natural"];
    for (const name of preferredNames) {
      const match = voices.find((v) => v.lang.startsWith("en") && v.name.includes(name));
      if (match) return match;
    }
    const anyEn = voices.find((v) => v.lang.startsWith("en-US")) || voices.find((v) => v.lang.startsWith("en"));
    if (anyEn) return anyEn;
  }

  // 3. Persian preset
  if (preset === "persian") {
    const persianVoice = voices.find((v) => v.lang.startsWith("fa"));
    if (persianVoice) return persianVoice;
  }

  // 4. Arabic preset
  if (preset === "arabic") {
    const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
    if (arabicVoice) return arabicVoice;
  }

  // 5. Russian preset
  if (preset === "russian") {
    const russianVoice = voices.find((v) => v.lang.startsWith("ru"));
    if (russianVoice) return russianVoice;
  }

  // 6. Auto preset: English (for clean Latin pronunciation) -> Persian -> Arabic -> Russian -> Default
  const enMatch = voices.find((v) => v.lang.startsWith("en-US")) || voices.find((v) => v.lang.startsWith("en"));
  if (enMatch) return enMatch;

  const persian = voices.find((v) => v.lang.startsWith("fa"));
  if (persian) return persian;

  const arabic = voices.find((v) => v.lang.startsWith("ar"));
  if (arabic) return arabic;

  const russian = voices.find((v) => v.lang.startsWith("ru"));
  if (russian) return russian;

  const defaultVoice = voices.find((v) => v.default) ?? voices[0];
  return defaultVoice || null;
}

// Prepare spoken text based on mode and language
export function formatSpeechText(
  name: TajikRegistryName,
  mode: SpeechReadingMode = "name_only",
  voiceLang?: string
): string {
  const isEnglish = voiceLang?.startsWith("en");
  const isPersian = voiceLang?.startsWith("fa");
  const isArabic = voiceLang?.startsWith("ar");

  // When reading with English or foreign voice, use official Latin transcription (name_latin)
  // which reads all letters accurately without skipping special Tajik Cyrillic characters!
  let baseName = name.name_tj;
  if (isEnglish || isPersian || isArabic) {
    baseName = name.name_latin ? name.name_latin : cyrillicToPhoneticLatin(name.name_tj);
  }

  if (mode === "name_only") {
    return baseName;
  }

  if (mode === "name_meaning") {
    if (name.meaning) {
      if (isEnglish) {
        return `${baseName}. Meaning: ${name.meaning}`;
      }
      return `${baseName}. Маъно: ${name.meaning}`;
    }
    return baseName;
  }

  // Full mode
  if (isEnglish) {
    const genderWord = name.gender === "male" ? "Male name" : "Female name";
    if (name.meaning) {
      return `Number ${name.num}. ${baseName}. ${genderWord}. Meaning: ${name.meaning}`;
    }
    return `Number ${name.num}. ${baseName}. ${genderWord}`;
  }

  const genderWord = name.gender === "male" ? "Номи писарона" : "Номи духтарона";
  if (name.meaning) {
    return `Рақами ${name.num}. ${baseName}. ${genderWord}. Маъно: ${name.meaning}`;
  }
  return `Рақами ${name.num}. ${baseName}. ${genderWord}`;
}

// Single name quick speech
export function speakName(
  text: string,
  lang: "en-US" | "ru-RU" | "ar-SA" | "fa-IR" = "en-US",
  options?: Partial<SpeechOptions>
): boolean {
  if (!ttsSupported()) return false;

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = options?.rate ?? 0.75; // Slower default for clarity
    utter.pitch = options?.pitch ?? 1.0;
    utter.volume = options?.volume ?? 1.0;

    const voices = synth.getVoices();
    if (options?.voice) {
      utter.voice = options.voice;
      utter.lang = options.voice.lang;
    } else {
      utter.lang = lang;
      const match =
        voices.find((v) => v.lang === lang) ??
        voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (match) {
        utter.voice = match;
      }
    }

    if (options?.onStart) utter.onstart = options.onStart;
    if (options?.onEnd) utter.onend = options.onEnd;
    if (options?.onError) utter.onerror = options.onError;

    synth.speak(utter);
    return true;
  } catch (err) {
    console.warn("TTS Error:", err);
    return false;
  }
}

// Stop any ongoing speech
export function stopSpeech(): void {
  if (ttsSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Pause speech
export function pauseSpeech(): void {
  if (ttsSupported()) {
    window.speechSynthesis.pause();
  }
}

// Resume speech
export function resumeSpeech(): void {
  if (ttsSupported()) {
    window.speechSynthesis.resume();
  }
}
