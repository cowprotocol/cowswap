import { FormEvent, KeyboardEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

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
  const placeholder = voice.listening ? 'Listening…' : 'Describe a trade, or ask a question…'

  // Layout effect, not effect: the height is measured and written before paint, so
  // the box never renders at the wrong size first. Dictation makes that visible —
  // text arrives in bursts, and a frame at the old height reads as a flicker.
  //
  // The placeholder is a dependency because it's part of what has to fit, and it
  // changes without the value changing when dictation starts.
  useLayoutEffect(() => growToFit(field.current), [shown, placeholder])

  // The placeholder wraps differently at different widths, so a resize can clip it
  // again. Observing the box itself covers the drawer becoming a full-screen sheet,
  // which no window-level listener would report reliably.
  useEffect(() => {
    const el = field.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(() => growToFit(el))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
          placeholder={placeholder}
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
 * Sizes the box to whichever is taller: its content, or its placeholder.
 *
 * The reset to `auto` first is what makes it shrink again — scrollHeight can never
 * report less than the height already set, so without it the box only ever grows
 * and deleting a long request leaves a tall empty field behind. The max-height in
 * the stylesheet caps it; past that the textarea scrolls on its own.
 *
 * ⚠️ **A placeholder contributes nothing to scrollHeight**, so measuring an empty
 * box reports one line however long the hint is. That clipped "Describe a trade, or
 * ask a question…" to its first line and put a scrollbar on an empty field — the
 * text you most need to read is the text that's there before you've typed anything.
 *
 * So when the box is empty, measure the placeholder as though it were the value.
 * Writing to `el.value` here is safe despite React owning it: the value is restored
 * within the same synchronous block, inside a layout effect, so nothing paints in
 * between and React's own idea of the value never changes.
 */
function growToFit(el: HTMLTextAreaElement | null): void {
  if (!el) return

  const measuringPlaceholder = el.value === '' && Boolean(el.placeholder)
  if (measuringPlaceholder) el.value = el.placeholder

  el.style.height = 'auto'
  const needed = el.scrollHeight

  if (measuringPlaceholder) el.value = ''
  el.style.height = `${needed}px`
}
