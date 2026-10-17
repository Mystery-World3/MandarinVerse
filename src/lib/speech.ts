/**
 * Client-side audio pronunciation utility for Mandarin Chinese.
 * Uses Web Speech API (speechSynthesis) with zh-CN locale.
 * Compatible with modern desktop and mobile browsers.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakChinese(text: string, rate: number = 0.85): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = rate; // 0.85 is ideal for language learners
      utterance.pitch = 1.0;

      // Find best Chinese voice if available
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(
        (v) => v.lang === "zh-CN" || v.lang.startsWith("zh") || v.name.includes("Chinese")
      );
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        // Resolve anyway to prevent blocking UI
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      resolve();
    }
  });
}
