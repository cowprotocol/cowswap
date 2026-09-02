import { ReactNode, RefObject } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../containers/AssistantDrawer/styled'

export interface VisibleMessage {
  role: string
  text: string
}

interface MessageListProps {
  /** Rendered after the transcript — the preamble and the proposal card. */
  children?: ReactNode
  busy: boolean
  error: string | null
  greeting: string
  messages: VisibleMessage[]
  scrollRef: RefObject<HTMLDivElement | null>
  /** What the backend is doing right now, e.g. "Reading the docs". */
  status: string | null
  /** Prose as it arrives, before the authoritative history replaces it. */
  streamText: string
}

export function MessageList({
  busy,
  children,
  error,
  greeting,
  messages,
  scrollRef,
  status,
  streamText,
}: MessageListProps): ReactNode {
  return (
    <styledEl.Messages ref={scrollRef}>
      <styledEl.Message from="assistant">{greeting}</styledEl.Message>

      {messages.map((message, index) => (
        <styledEl.Message key={index} from={message.role === 'user' ? 'user' : 'assistant'}>
          {message.text}
        </styledEl.Message>
      ))}

      {/* Discarded when the turn completes and re-rendered from the history above,
          so nothing here is ever the final record. */}
      {streamText && <styledEl.Message from="assistant">{streamText}</styledEl.Message>}

      {/* Shown below streamed text too, so a tool starting mid-turn stays visible —
          otherwise the slowest turns are the ones that look like nothing is happening. */}
      {busy && (status || !streamText) && (
        <styledEl.Thinking>{status ? `${status}…` : <Trans>Thinking…</Trans>}</styledEl.Thinking>
      )}

      {children}

      {error && <styledEl.ErrorMessage>{error}</styledEl.ErrorMessage>}
    </styledEl.Messages>
  )
}
