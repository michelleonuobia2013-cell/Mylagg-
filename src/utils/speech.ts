/**
 * mylag - Text-to-Speech Accessibility Helper
 */

let ttsEnabled = false;

export function setTtsEnabled(enabled: boolean) {
  ttsEnabled = enabled;
  if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isTtsEnabled(): boolean {
  return ttsEnabled;
}

export function speakText(text: string) {
  if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Look for British or English voices with natural delivery
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang.includes('en-GB') || v.lang.includes('en-NG')) ||
      voices.find((v) => v.lang.includes('en')) ||
      null;

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}
