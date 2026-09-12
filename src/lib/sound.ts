/** Plays a short two-tone "payment received" chime using the Web Audio API (no audio asset needed). */
export function playPaymentChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime

    const tones: [freq: number, start: number, dur: number][] = [
      [880, 0, 0.14],
      [1318.5, 0.14, 0.22],
    ]

    for (const [freq, start, dur] of tones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.35, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.02)
    }

    setTimeout(() => ctx.close(), 700)
  } catch {
    // audio not available; ignore
  }
}

export function vibrate(pattern: number | number[] = [40, 60, 120]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}
