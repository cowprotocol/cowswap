import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

interface SpeechRecognitionEventLike {
  readonly resultIndex: number
  readonly results: { readonly length: number; [index: number]: SpeechRecognitionResultLike }
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  abort(): void
  start(): void
  stop(): void
}

/**
 * Minimal structural types for the Web Speech API.
 *
 * Declared here rather than relying on lib.dom: the interface is still vendor
 * prefixed in every shipping browser, and TypeScript's DOM types don't cover it
 * consistently across versions.
 */
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: { readonly transcript: string }
}

/**
 * Action words, kept separate because the risk profile is different.
 *
 * A mangled ticker produces a request that doesn't parse. A mangled VERB produces
 * one that parses perfectly and means the opposite — the worst failure available
 * here, and why the prompt already warns about buy/sell.
 *
 * So these are held to a higher bar than the tickers:
 * - "cell" is safe to rewrite outright; nobody dictates biology into a trade box.
 * - "by" is only rewritten at the START of an utterance. Mid-sentence it's far too
 *   common ("divided by", "by the way") to touch, and rewriting it in the wrong
 *   place would invent an order rather than garble one.
 */
const ACTION_FIXES: [RegExp, string][] = [
  [/\bcell\b/gi, 'sell'],
  [/\bsale\b/gi, 'sell'],
  [/^by\b/i, 'buy'],
  [/\brap\b/gi, 'wrap'],
  [/\bswamp\b/gi, 'swap'],
]

/**
 * Tickers the recogniser reliably mangles.
 *
 * ⚠️ There is no API for this. SpeechGrammarList exists and looks like the answer,
 * but MDN is explicit that grammars "have no effect on speech recognition services"
 * — deprecated and inert. Correcting afterwards is the only lever there is.
 *
 * Safe to be moderately aggressive because the transcript lands in the composer to
 * be read before sending, so a wrong correction is visible and editable rather than
 * silently traded. Words common in ordinary English are still left alone: "day" and
 * "die" are NOT mapped to DAI.
 *
 * Add to this as you hear new ones — it's a list, not a system, and it will never
 * be complete. The model reading numbers back (see `inputMode` in the prompt) is
 * what catches the manglings this list has never seen.
 */
const TICKER_FIXES: [RegExp, string][] = [
  [/\bearth\b/gi, 'ETH'],
  [/\beath\b/gi, 'ETH'],
  [/\baeth\b/gi, 'ETH'],
  [/\bether(?:i|e)um\b/gi, 'ETH'],
  [/\bweath\b/gi, 'WETH'],
  [/\bwrapped eth\b/gi, 'WETH'],
  [/\bbit ?coin\b/gi, 'BTC'],
]

/** Tickers we'll accept from a spelled-out letter sequence, e.g. "u s d c". */
const SPELLED_TICKERS = new Set(['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'COW', 'BTC', 'WBTC'])

export interface VoiceInput {
  error: string | null
  listening: boolean
  start(): void
  stop(): void
  supported: boolean
  toggle(): void
}

interface VoiceInputOptions {
  /** Live, unstable text while speaking — show it, don't act on it. */
  onInterim?(text: string): void
  /** Corrected final transcript. */
  onTranscript?(text: string): void
}

/**
 * Clean up a raw transcript.
 *
 * Two passes: collapse letters dictated one at a time ("u s d c" → USDC), then fix
 * known homophones. The spelled-out pass runs first so "e t h" becomes ETH before
 * anything else can act on the loose letters.
 */
export function correctTranscript(text: string): string {
  const spelled = text.replace(/\b(?:[a-z][\s.]+){1,4}[a-z]\b/gi, (match) => {
    const joined = match.replace(/[\s.]/g, '').toUpperCase()
    return SPELLED_TICKERS.has(joined) ? joined : match
  })

  return [...ACTION_FIXES, ...TICKER_FIXES].reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    spelled,
  )
}

/**
 * Speech-to-text using the browser's own SpeechRecognition.
 *
 * Chosen over MediaRecorder plus a transcription endpoint because it needs no API
 * key, no backend and costs nothing — and typing still works when it's unavailable,
 * so it degrades to exactly the behaviour without it.
 *
 * ⚠️ Chrome, Edge and Safari only. Firefox has no implementation, so callers must
 * check `supported` and hide the control rather than showing one that fails.
 * Requires HTTPS (or localhost) and microphone permission.
 *
 * **The transcript is handed back, not submitted.** Transcription confuses
 * "buy"/"sell" and "five"/"fifty", and this fills in trades — letting someone read
 * what was heard before sending is the cheapest guardrail available.
 */
export function useVoiceInput({ onInterim, onTranscript }: VoiceInputOptions = {}): VoiceInput {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognition = useRef<SpeechRecognitionLike | null>(null)

  // Callbacks live in a ref so the recognition instance, created once, never calls
  // a stale version of them.
  const handlers = useRef({ onInterim, onTranscript })
  useEffect(() => {
    handlers.current = { onInterim, onTranscript }
  }, [onInterim, onTranscript])

  const SpeechRecognition = getSpeechRecognition()
  const supported = Boolean(SpeechRecognition)

  useEffect(() => {
    if (!SpeechRecognition) return undefined

    const instance = new SpeechRecognition()
    // One utterance at a time: this is a composer, not a dictation surface.
    instance.continuous = false
    // Interim results let the box fill in as you speak, which is the difference
    // between "it's working" and "did that do anything?".
    instance.interimResults = true
    instance.maxAlternatives = 1
    instance.lang = navigator.language || 'en-US'

    instance.onresult = (event: SpeechRecognitionEventLike): void => {
      let final = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) final += result[0].transcript
        else interim += result[0].transcript
      }

      if (interim) handlers.current.onInterim?.(interim)
      if (final) handlers.current.onTranscript?.(correctTranscript(final.trim()))
    }

    instance.onerror = (event: { error: string }): void => {
      // 'aborted' and 'no-speech' are ordinary outcomes of stopping or saying
      // nothing — surfacing them as errors would be noise.
      if (event.error === 'aborted' || event.error === 'no-speech') return

      setError(
        event.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser to use voice.'
          : "Couldn't hear that — try again, or type instead.",
      )
    }

    instance.onend = (): void => setListening(false)
    recognition.current = instance

    return () => {
      instance.onresult = null
      instance.onerror = null
      instance.onend = null
      try {
        instance.abort()
      } catch {
        // Already stopped; nothing to do.
      }
      recognition.current = null
    }
  }, [SpeechRecognition])

  const start = useCallback((): void => {
    if (!recognition.current || listening) return
    setError(null)
    try {
      recognition.current.start()
      setListening(true)
    } catch {
      // start() throws if already running; treat that as already listening.
      setListening(true)
    }
  }, [listening])

  const stop = useCallback((): void => {
    // stop() finalises what it heard; abort() would discard it.
    recognition.current?.stop()
  }, [])

  const toggle = useCallback((): void => (listening ? stop() : start()), [listening, start, stop])

  return { supported, listening, error, start, stop, toggle }
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null

  const candidate = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return candidate.SpeechRecognition || candidate.webkitSpeechRecognition || null
}
