import { useCallback, useEffect, useRef, useState } from 'react'
import type { VoiceLang } from './types'

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported(): boolean {
  return !!getRecognitionCtor()
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string, lang: VoiceLang = 'en-IN') {
  if (!isSpeechSynthesisSupported()) return
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = 1
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
}

interface UseVoiceInputOptions {
  lang?: VoiceLang
  onFinalResult?: (text: string) => void
}

interface UseVoiceInputResult {
  supported: boolean
  listening: boolean
  transcript: string
  error: string | null
  start: () => void
  stop: () => void
}

export function useVoiceInput({ lang = 'en-IN', onFinalResult }: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const supported = isSpeechRecognitionSupported()
  const onFinalResultRef = useRef(onFinalResult)
  useEffect(() => {
    onFinalResultRef.current = onFinalResult
  }, [onFinalResult])

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = lang
  }, [lang])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setError('not-supported')
      return
    }
    setError(null)
    setTranscript('')
    const recognition = new Ctor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = lang
    recognition.onresult = (event) => {
      let text = ''
      let isFinal = false
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript
        if (event.results[i].isFinal) isFinal = true
      }
      setTranscript(text.trim())
      if (isFinal) onFinalResultRef.current?.(text.trim())
    }
    recognition.onerror = (e) => {
      setError(e.error)
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [lang])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  return { supported, listening, transcript, error, start, stop }
}
