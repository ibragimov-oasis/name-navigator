import { describe, it, expect } from "vitest";
import {
  cyrillicToPhoneticLatin,
  formatSpeechText,
  resolveBestVoice,
} from "@/lib/tts";
import { TajikRegistryName } from "@/data/tajikTypes";

describe("TTS & Audio Reader Engine", () => {
  const sampleName: TajikRegistryName = {
    id: "tj-1",
    num: 1,
    name_tj: "Абирафшон",
    name_tj_raw: "Абирафшон",
    name_cyrillic: "Абирафшон",
    name_cyrillic_raw: "Абирафшон",
    name_latin: "Abirafshon",
    name_latin_raw: "Abirafshon",
    gender: "male",
    gender_label: "Мужской",
    gender_tj: "Писарона",
    letter: "А",
    is_official_permitted: true,
    legal_decree: "Постановление №98",
    is_enriched: true,
    meaning: "Рӯи тобон ва равшан",
  };

  it("converts cyrillic to clean phonetic latin", () => {
    expect(cyrillicToPhoneticLatin("Абирафшон")).toBe("Abirafshon");
    expect(cyrillicToPhoneticLatin("Ҷаҳонгир")).toBe("Jahongir");
    expect(cyrillicToPhoneticLatin("Ғафур")).toBe("Ghafur");
  });

  it("formats text correctly for different reading modes", () => {
    // 1. Name only
    expect(formatSpeechText(sampleName, "name_only")).toBe("Абирафшон");

    // 2. Name with meaning
    expect(formatSpeechText(sampleName, "name_meaning")).toContain("Маъно: Рӯи тобон ва равшан");

    // 3. Full mode
    const fullText = formatSpeechText(sampleName, "full");
    expect(fullText).toContain("Рақами 1");
    expect(fullText).toContain("Абирафшон");
    expect(fullText).toContain("Номи писарона");
  });

  it("formats clean Latin phonetic text when voice is English, Persian, or Arabic", () => {
    const textForEnglish = formatSpeechText(sampleName, "name_only", "en-US");
    expect(textForEnglish).toBe("Abirafshon");

    const textForEnglishFull = formatSpeechText(sampleName, "full", "en-US");
    expect(textForEnglishFull).toContain("Number 1");
    expect(textForEnglishFull).toContain("Abirafshon");
    expect(textForEnglishFull).toContain("Male name");

    const textForPersian = formatSpeechText(sampleName, "name_only", "fa-IR");
    expect(textForPersian).toBe("Abirafshon");

    const textForArabic = formatSpeechText(sampleName, "name_only", "ar-SA");
    expect(textForArabic).toBe("Abirafshon");
  });

  it("resolves best voice preset including English Latin recommendation", () => {
    const mockVoices = [
      { name: "Samantha", lang: "en-US", voiceURI: "uri-en-1", default: false },
      { name: "Siri Russian", lang: "ru-RU", voiceURI: "uri-ru-1", default: false },
      { name: "Dariush Persian", lang: "fa-IR", voiceURI: "uri-fa-1", default: false },
      { name: "Maged Arabic", lang: "ar-SA", voiceURI: "uri-ar-1", default: false },
    ] as SpeechSynthesisVoice[];

    const englishVoice = resolveBestVoice(mockVoices, "english");
    expect(englishVoice?.lang).toBe("en-US");
    expect(englishVoice?.name).toBe("Samantha");

    const persianVoice = resolveBestVoice(mockVoices, "persian");
    expect(persianVoice?.lang).toBe("fa-IR");

    const arabicVoice = resolveBestVoice(mockVoices, "arabic");
    expect(arabicVoice?.lang).toBe("ar-SA");

    const russianVoice = resolveBestVoice(mockVoices, "russian");
    expect(russianVoice?.lang).toBe("ru-RU");

    const autoVoice = resolveBestVoice(mockVoices, "auto");
    expect(autoVoice?.lang).toBe("en-US");
  });
});
