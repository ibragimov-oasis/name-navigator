/**
 * Web Speech TTS helper. Tries to pick the best voice for the language.
 */
export function speakName(name: string, lang: "ru-RU" | "ar-SA" | "en-US" = "ru-RU") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(name);
    utter.lang = lang;
    utter.rate = 0.92;
    utter.pitch = 1;
    const voices = synth.getVoices();
    const match = voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (match) utter.voice = match;
    synth.speak(utter);
    return true;
  } catch {
    return false;
  }
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
