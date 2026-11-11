/**
 * PCM AudioWorklet Processor for real-time streaming audio playback.
 * Sample rate: 24000 Hz, 1 channel (mono).
 * Designed for APIIT Sri Lanka AI Admissions & Information Kiosk.
 */
class PCMPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Capacity for up to 60 seconds of 24kHz audio (1,440,000 samples)
    this.buffer = new Float32Array(24000 * 60);
    this.readIndex = 0;
    this.writeIndex = 0;
    this.bufferedSamples = 0;

    this.isFlushed = false;
    this.isPlaying = false;
    // 100ms jitter buffer at 24kHz (2400 samples) before initial sound starts
    this.minBufferBeforePlay = 2400;

    this.port.onmessage = (event) => {
      const msg = event.data;
      if (!msg) return;

      switch (msg.type) {
        case "push": {
          const samples = msg.samples;
          if (!samples || samples.length === 0) return;

          for (let i = 0; i < samples.length; i++) {
            this.buffer[this.writeIndex] = samples[i];
            this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
          }
          this.bufferedSamples += samples.length;

          if (!this.isPlaying && this.bufferedSamples >= this.minBufferBeforePlay) {
            this.isPlaying = true;
            this.port.postMessage({ type: "playback_started" });
          }
          break;
        }

        case "flush": {
          this.isFlushed = true;
          // If buffered amount was less than jitter buffer, start immediately on flush
          if (!this.isPlaying && this.bufferedSamples > 0) {
            this.isPlaying = true;
            this.port.postMessage({ type: "playback_started" });
          } else if (this.bufferedSamples === 0) {
            this.isPlaying = false;
            this.port.postMessage({ type: "playback_ended" });
          }
          break;
        }

        case "clear": {
          this.readIndex = 0;
          this.writeIndex = 0;
          this.bufferedSamples = 0;
          this.isFlushed = false;
          this.isPlaying = false;
          this.port.postMessage({ type: "playback_cleared" });
          break;
        }
      }
    };
  }

  process(inputs, outputs) {
    const output = outputs[0];
    if (!output || output.length === 0) return true;

    const channel = output[0];
    const frameCount = channel.length; // Standard Web Audio quantum is 128 samples

    if (!this.isPlaying || this.bufferedSamples === 0) {
      if (this.isFlushed && this.bufferedSamples === 0 && this.isPlaying) {
        this.isPlaying = false;
        this.isFlushed = false;
        this.port.postMessage({ type: "playback_ended" });
      }

      // Output silence
      channel.fill(0);
      return true;
    }

    const toRead = Math.min(frameCount, this.bufferedSamples);
    for (let i = 0; i < toRead; i++) {
      channel[i] = this.buffer[this.readIndex];
      this.readIndex = (this.readIndex + 1) % this.buffer.length;
    }
    this.bufferedSamples -= toRead;

    // Zero-fill remaining slots in frame if starved
    for (let i = toRead; i < frameCount; i++) {
      channel[i] = 0;
    }

    // Finished stream check
    if (this.isFlushed && this.bufferedSamples === 0) {
      this.isPlaying = false;
      this.isFlushed = false;
      this.port.postMessage({ type: "playback_ended" });
    }

    return true;
  }
}

registerProcessor("pcm-player-processor", PCMPlayerProcessor);

