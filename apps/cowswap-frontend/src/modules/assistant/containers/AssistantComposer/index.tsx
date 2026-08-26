import { FormEvent, KeyboardEvent, ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react'

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
  const field = useRef<HTMLTextAreaElement | null>(null)

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

  // What's actually in the box: typed text, plus whatever is being said right now.
  const shown = heard ? `${input} ${heard}`.trim() : input

  // Layout effect, not effect: the height is measured and written before paint, so
  // the box never renders at the wrong size first. Dictation makes that visible —
  // text arrives in bursts, and a frame at the old height reads as a flicker.
  useLayoutEffect(() => growToFit(field.current), [shown])

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

  // A textarea doesn't submit on Enter the way an input does, and this is a chat
  // box: Enter sends. Shift+Enter is the escape hatch for a deliberate newline.
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== 'Enter' || event.shiftKey) return
      // Mid-composition Enter commits an IME candidate — it isn't a send.
      if (event.nativeEvent.isComposing) return
      submit(event)
    },
    [submit],
  )

  return (
    <>
      {voice.error && <styledEl.ErrorMessage>{voice.error}</styledEl.ErrorMessage>}
      <styledEl.Composer onSubmit={submit}>
        <styledEl.Input
          ref={field}
          rows={1}
          value={shown}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
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

/**
 * Sizes the box to its content.
 *
 * The reset to `auto` first is what makes it shrink again — scrollHeight can never
 * report less than the height already set, so without it the box only ever grows
 * and deleting a long request leaves a tall empty field behind. The max-height in
 * the stylesheet caps it; past that the textarea scrolls on its own.
 */
function growToFit(el: HTMLTextAreaElement | null): void {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
