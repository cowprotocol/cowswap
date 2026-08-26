import { FormEvent, ReactNode, useCallback, useRef, useState } from 'react'

import { useVoiceInput } from '../../hooks/useVoiceInput'
import { AssistantUiContext } from '../../types'
import * as styledEl from '../AssistantDrawer/styled'

interface AssistantComposerProps {
  busy: boolean
  onSend(text: string, inputMode: NonNullable<AssistantUiContext['inputMode']>): void
}

/**
 * The input, the mic and Send.
 *
 * Owns its own text so the drawer doesn't re-render the transcript on every
 * keystroke, and reports HOW the text arrived — the prompt treats dictated numbers
 * with more suspicion than typed ones, and can only do that if it's told.
 */
export function AssistantComposer({ busy, onSend }: AssistantComposerProps): ReactNode {
  const [input, setInput] = useState('')
  const [heard, setHeard] = useState('')

  // Stays true even if the text is edited afterwards: partly-spoken input deserves
  // the same care as wholly-spoken input, and erring toward more care is cheap.
  const spoken = useRef(false)

  const voice = useVoiceInput({
    onInterim: setHeard,
    onTranscript: (text) => {
      setHeard('')
      spoken.current = true
      setInput((current) => (current ? `${current} ${text}` : text))
    },
  })

  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const text = input.trim()
      if (!text) return

      setInput('')
      onSend(text, spoken.current ? 'voice' : 'typed')
      spoken.current = false
    },
    [input, onSend],
  )

  return (
    <>
      {voice.error && <styledEl.ErrorMessage>{voice.error}</styledEl.ErrorMessage>}
      <styledEl.Composer onSubmit={submit}>
        <styledEl.Input
          value={heard ? `${input} ${heard}`.trim() : input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={voice.listening ? 'Listening…' : 'Describe a trade, or ask a question…'}
          disabled={busy}
        />

        {/* Hidden where unsupported: Firefox has no implementation, and a mic that
            silently fails is worse than no mic. */}
        {voice.supported && (
          <styledEl.MicButton
            type="button"
            isListening={voice.listening}
            onClick={voice.toggle}
            disabled={busy}
            aria-label={voice.listening ? 'Stop listening' : 'Speak your request'}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="6" y="2" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4 8a4 4 0 0 0 8 0M8 12v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </styledEl.MicButton>
        )}

        <styledEl.SendButton type="submit" disabled={busy || !input.trim()} aria-label="Send">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </styledEl.SendButton>
      </styledEl.Composer>
    </>
  )
}
