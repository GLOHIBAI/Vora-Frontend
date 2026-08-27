/**
 * Background speech transcriber using browser-native Web Speech API.
 * Captures real-time audio transcripts in the background without UI display
 * to send alongside Stage 3 video uploads and reduce backend processing latency.
 */

const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      null
    : null;

export class BackgroundSpeechTranscriber {
  private recognition: any = null;
  private isRunning = false;
  private finalTranscript = '';
  private interimTranscript = '';

  constructor(lang = 'en-US') {
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = lang;

        rec.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item && item[0]) {
              const text = item[0].transcript || '';
              if (item.isFinal) {
                this.finalTranscript += (this.finalTranscript ? ' ' : '') + text.trim();
              } else {
                interim += text;
              }
            }
          }
          this.interimTranscript = interim;
        };

        rec.onerror = (event: any) => {
          // Informational only — audio glitches or pauses shouldn't crash the recorder
          if (event?.error !== 'no-speech') {
            console.warn('Background speech recognition notice:', event?.error);
          }
        };

        rec.onend = () => {
          // Restart if still marked as actively recording (handles browser pause timeouts)
          if (this.isRunning) {
            try {
              rec.start();
            } catch {
              // Ignore if already running or stopped
            }
          }
        };

        this.recognition = rec;
      } catch (err) {
        console.warn('Web Speech API initialization warning:', err);
      }
    }
  }

  public isSupported(): boolean {
    return !!SpeechRecognition;
  }

  public start() {
    const isEnabled = import.meta.env.VITE_ENABLE_FRONTEND_TRANSCRIPTION !== 'false';
    if (!isEnabled || !this.recognition) return;

    this.finalTranscript = '';
    this.interimTranscript = '';
    this.isRunning = true;

    try {
      this.recognition.start();
    } catch {
      // Ignore if recognition is already started
    }
  }

  public stop(): string {
    this.isRunning = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore if already stopped
      }
    }

    const full = `${this.finalTranscript} ${this.interimTranscript}`.trim();
    return full;
  }

  public reset() {
    this.isRunning = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  public getTranscript(): string {
    return `${this.finalTranscript} ${this.interimTranscript}`.trim();
  }
}
