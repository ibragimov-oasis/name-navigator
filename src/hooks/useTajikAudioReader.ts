import { useState, useEffect, useRef, useCallback } from "react";
import { TajikRegistryName } from "@/data/tajikTypes";
import {
  ttsSupported,
  getSystemVoices,
  resolveBestVoice,
  formatSpeechText,
  VoicePreset,
  SpeechReadingMode,
} from "@/lib/tts";
import { toast } from "sonner";

export interface AudioReaderSettings {
  startPage: number;
  endPage: number;
  speed: number; // 0.5 - 2.0
  volume: number; // 0.0 - 1.0
  pitch: number; // 0.5 - 1.5
  voicePreset: VoicePreset;
  selectedVoiceUri: string;
  mode: SpeechReadingMode;
  pauseBetween: number; // in milliseconds, e.g. 700
  autoFlipPage: boolean;
  autoScroll: boolean;
}

export interface UseTajikAudioReaderProps {
  itemsPerPage?: number;
  onPageChange?: (newPage: number) => void;
}

export function useTajikAudioReader({
  itemsPerPage = 36,
  onPageChange,
}: UseTajikAudioReaderProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentName, setCurrentName] = useState<TajikRegistryName | null>(null);
  const [playlist, setPlaylist] = useState<TajikRegistryName[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AudioReaderSettings>({
    startPage: 1,
    endPage: 1,
    speed: 0.95,
    volume: 1.0,
    pitch: 1.0,
    voicePreset: "auto",
    selectedVoiceUri: "auto",
    mode: "name_only",
    pauseBetween: 700,
    autoFlipPage: true,
    autoScroll: true,
  });

  // Active voice resolved from preset/system
  const [activeVoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Refs for tracking mutable playback state across callbacks
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const playlistRef = useRef<TajikRegistryName[]>([]);
  const settingsRef = useRef<AudioReaderSettings>(settings);
  const nextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load available system voices on mount
  useEffect(() => {
    if (!ttsSupported()) return;

    getSystemVoices().then((voices) => {
      setAvailableVoices(voices);
      const best = resolveBestVoice(voices, settings.voicePreset, settings.selectedVoiceUri);
      setActiveVoice(best);
    });

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const handleVoicesChanged = () => {
        const v = window.speechSynthesis.getVoices();
        setAvailableVoices(v);
        const best = resolveBestVoice(v, settingsRef.current.voicePreset, settingsRef.current.selectedVoiceUri);
        setActiveVoice(best);
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      };
    }
  }, []);

  // Update resolved voice when settings change
  useEffect(() => {
    if (availableVoices.length > 0) {
      const resolved = resolveBestVoice(availableVoices, settings.voicePreset, settings.selectedVoiceUri);
      setActiveVoice(resolved);
    }
  }, [settings.voicePreset, settings.selectedVoiceUri, availableVoices]);

  // Stop / cancel speech on unmount
  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) {
        clearTimeout(nextTimeoutRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Core function: Speak single item by index
  const speakCurrentItem = useCallback(
    (index: number) => {
      if (!ttsSupported()) {
        toast.error("Браузери шумо хониши овозиро (TTS) дастгирӣ намекунад");
        setIsPlaying(false);
        return;
      }

      const currentList = playlistRef.current;
      if (index < 0 || index >= currentList.length) {
        // Reached the end of playlist
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentName(null);
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        toast.success("Хониши феҳрист бомуваффақият ба охир расид! ✨");
        return;
      }

      const item = currentList[index];
      setCurrentIndex(index);
      setCurrentName(item);

      // Check page and trigger page change if autoFlipPage is enabled
      const currentConfig = settingsRef.current;
      if (currentConfig.autoFlipPage && onPageChange) {
        // If playlist is sliced or full, calculate the page relative to the full catalog
        const itemPage = Math.floor(index / itemsPerPage) + 1;
        onPageChange(itemPage);
      }

      // Auto-scroll to active element
      if (currentConfig.autoScroll && typeof document !== "undefined") {
        setTimeout(() => {
          const el = document.getElementById(`name-card-${item.id}`) || document.getElementById(`name-row-${item.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }

      const synth = window.speechSynthesis;
      synth.cancel();

      const textToSpeak = formatSpeechText(item, currentConfig.mode, activeVoice?.lang);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;

      utterance.rate = Math.max(0.5, Math.min(2.0, currentConfig.speed));
      utterance.pitch = Math.max(0.5, Math.min(1.5, currentConfig.pitch));
      utterance.volume = Math.max(0.0, Math.min(1.0, currentConfig.volume));

      if (activeVoice) {
        utterance.voice = activeVoice;
        utterance.lang = activeVoice.lang;
      } else {
        utterance.lang = "ru-RU";
      }

      utterance.onend = () => {
        if (!isPlayingRef.current || isPausedRef.current) return;

        // Schedule next item with configured pause interval
        if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);

        nextTimeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current && !isPausedRef.current) {
            speakCurrentItem(index + 1);
          }
        }, currentConfig.pauseBetween);
      };

      utterance.onerror = (e) => {
        // Ignored if cancelled purposefully
        if (e.error === "canceled" || e.error === "interrupted") return;
        console.warn("TTS Utterance Error:", e);
        // Continue to next item on non-fatal error
        if (isPlayingRef.current && !isPausedRef.current) {
          nextTimeoutRef.current = setTimeout(() => {
            speakCurrentItem(index + 1);
          }, currentConfig.pauseBetween);
        }
      };

      synth.speak(utterance);
    },
    [activeVoice, itemsPerPage, onPageChange]
  );

  // Start reading a full or custom subset of names
  const startReading = useCallback(
    (namesList: TajikRegistryName[], startIndex = 0) => {
      if (!namesList || namesList.length === 0) {
        toast.error("Рӯйхати номҳо барои хониш холӣ аст");
        return;
      }

      if (nextTimeoutRef.current) {
        clearTimeout(nextTimeoutRef.current);
      }

      const validIndex = Math.max(0, Math.min(startIndex, namesList.length - 1));

      setPlaylist(namesList);
      playlistRef.current = namesList;
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      isPausedRef.current = false;

      toast.info(`Хониши худкор оғоз шуд (${namesList.length} ном)`);
      speakCurrentItem(validIndex);
    },
    [speakCurrentItem]
  );

  // Start reading by specific Page range (startPage to endPage)
  const startReadingPages = useCallback(
    (allNames: TajikRegistryName[], startPage: number, endPage: number) => {
      const sPage = Math.max(1, startPage);
      const totalPages = Math.ceil(allNames.length / itemsPerPage) || 1;
      const ePage = Math.min(totalPages, Math.max(sPage, endPage));

      const startIdx = (sPage - 1) * itemsPerPage;
      const endIdx = ePage * itemsPerPage;
      const scopedList = allNames.slice(startIdx, endIdx);

      if (scopedList.length === 0) {
        toast.error("Дар ин диапазон номҳо ёфт нашуданд");
        return;
      }

      setSettings((prev) => ({ ...prev, startPage: sPage, endPage: ePage }));
      startReading(scopedList, 0);
    },
    [itemsPerPage, startReading]
  );

  // Pause playback
  const pause = useCallback(() => {
    if (!isPlaying) return;
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPaused(true);
    isPausedRef.current = true;
  }, [isPlaying]);

  // Resume playback from current index
  const resume = useCallback(() => {
    if (!isPlaying || !isPaused) return;
    setIsPaused(false);
    isPausedRef.current = false;
    speakCurrentItem(currentIndexRef.current);
  }, [isPlaying, isPaused, speakCurrentItem]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      if (playlist.length > 0) {
        startReading(playlist, currentIndex);
      }
      return;
    }
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPlaying, isPaused, playlist, currentIndex, startReading, resume, pause]);

  // Stop playback completely
  const stop = useCallback(() => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentName(null);
    isPlayingRef.current = false;
    isPausedRef.current = false;
  }, []);

  // Jump to next name
  const next = useCallback(() => {
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < playlistRef.current.length) {
      speakCurrentItem(nextIdx);
    } else {
      stop();
      toast.success("Ба охири рӯйхат расидед");
    }
  }, [speakCurrentItem, stop]);

  // Jump to previous name
  const previous = useCallback(() => {
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    speakCurrentItem(prevIdx);
  }, [speakCurrentItem]);

  // Skip N items forward/backward
  const skip = useCallback(
    (offset: number) => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      const targetIdx = Math.max(0, Math.min(currentIndexRef.current + offset, playlistRef.current.length - 1));
      speakCurrentItem(targetIdx);
    },
    [speakCurrentItem]
  );

  // Jump to a specific index
  const jumpToIndex = useCallback(
    (targetIndex: number) => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      const safeIndex = Math.max(0, Math.min(targetIndex, playlistRef.current.length - 1));
      speakCurrentItem(safeIndex);
    },
    [speakCurrentItem]
  );

  // Update reader settings
  const updateSettings = useCallback((newSettings: Partial<AudioReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      settingsRef.current = updated;
      return updated;
    });
  }, []);

  // Progress percentage (0 to 100)
  const progress = playlist.length > 0 ? Math.round(((currentIndex + 1) / playlist.length) * 100) : 0;

  return {
    isPlaying,
    isPaused,
    currentIndex,
    currentName,
    playlist,
    totalCount: playlist.length,
    progress,
    settings,
    activeVoice,
    availableVoices,
    isAudioSettingsOpen,
    setIsAudioSettingsOpen,
    startReading,
    startReadingPages,
    pause,
    resume,
    togglePlay,
    stop,
    next,
    previous,
    skip,
    jumpToIndex,
    updateSettings,
  };
}
