import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { useSteadyStatus } from './useSteadyStatus'

import { streamConversation } from '../services/assistantApi'
import { conversationAtom, ConversationState, EMPTY_CONVERSATION } from '../state/conversationAtom'
import { AssistantMessage, AssistantTurn, AssistantUiContext } from '../types'

/**
 * Sent by the app, not typed by anyone, when a wrap the assistant proposed lands on
 * chain. Hidden from the transcript.
 */
export const WRAP_MARKER = '<WRAP_COMPLETED/>'

/**
 * Sent by the app when the form has worked out what a just-applied trade costs —
 * the assistant couldn't know any of it at proposal time.
 */
export const QUOTE_MARKER = '<QUOTE_LOADED/>'

/** Sent by the app when an order settles, with the executed amounts in uiContext. */
export const FILL_MARKER = '<ORDER_FILLED/>'

/** Sent by the app when an order is signed and posted, with lastPlacement attached. */
export const PLACED_MARKER = '<ORDER_PLACED/>'

export interface Conversation {
  error: string | null
  markApplied(): void
  /** What the backend is doing right now — "Reading the docs". */
  status: string | null
  /** Prose as it arrives, before the authoritative history replaces it. */
  streamText: string
  busy: boolean
  reset(): void
  send(text: string, uiContext: AssistantUiContext): Promise<void>
}

/** App-injected turns aren't the user's words and must not be rendered as them. */
export function isAppInjected(text: string): boolean {
  return (
    text.startsWith('<CURRENT_STATE>') ||
    text.startsWith(WRAP_MARKER) ||
    text.startsWith(QUOTE_MARKER) ||
    text.startsWith(FILL_MARKER) ||
    text.startsWith(PLACED_MARKER)
  )
}

export function useConversation(): Conversation {
  const [conversation, setConversation] = useAtom(conversationAtom)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamText, setStreamText] = useState('')
  const { status, show: showStatus, clear: clearStatus } = useSteadyStatus()

  const reset = useCallback(() => {
    setConversation(EMPTY_CONVERSATION)
    setError(null)
  }, [setConversation])

  const send = useCallback(
    async (text: string, uiContext: AssistantUiContext): Promise<void> => {
      const trimmed = text.trim()
      if (!trimmed || busy) return

      const previous = conversation
      const isNudge =
        trimmed === WRAP_MARKER || trimmed === QUOTE_MARKER || trimmed === FILL_MARKER || trimmed === PLACED_MARKER
      const next = [...conversation.messages, { role: 'user' as const, content: trimmed }]

      setConversation({
        ...conversation,
        messages: next,
        // A nudge comments on what's already there; a real turn replaces it.
        ...(isNudge ? {} : { proposal: null, proposalDisplay: null, preamble: null, proposalApplied: false }),
      })
      setBusy(true)
      setError(null)
      setStreamText('')
      clearStatus()

      try {
        const turn = await streamConversation({
          messages: next,
          uiContext,
          onText: (delta) => {
            clearStatus()
            setStreamText((prose) => prose + delta)
          },
          onStatus: (label) => {
            showStatus(label)
            // A tool starting means the previous prose block ended; without a break
            // one round's text runs into the next as a single paragraph.
            setStreamText((prose) => (prose && !prose.endsWith('\n\n') ? `${prose}\n\n` : prose))
          },
        })

        // Clear the live bubble in the same update as the authoritative history, or
        // both render together for a frame and the answer appears twice.
        setStreamText('')
        clearStatus()
        setConversation(fromTurn(turn, next))
      } catch (failure) {
        // A failed turn must not leave the user's message with no reply after it —
        // the next turn would then send two user messages in a row and be rejected.
        setConversation(previous)
        // A nudge is unprompted, so a failed one must not raise a banner about a
        // message the user never sent. But it must not vanish either: a silent
        // failure here is indistinguishable from the assistant having nothing to
        // say, which is how a broken quote check looks exactly like a working one.
        if (isNudge) console.warn('[assistant] nudge failed:', trimmed, failure)
        else setError(failure instanceof Error ? failure.message : 'Something went wrong.')
      } finally {
        setBusy(false)
        setStreamText('')
        clearStatus()
      }
    },
    // showStatus and clearStatus are stable by construction — see useSteadyStatus.
    [busy, clearStatus, conversation, setConversation, showStatus],
  )

  const markApplied = useCallback(
    () => setConversation((state) => ({ ...state, proposalApplied: true })),
    [setConversation],
  )

  return { busy, error, status, streamText, send, reset, markApplied }
}

/** The authoritative state a completed turn leaves behind. */
function fromTurn(turn: AssistantTurn, sent: AssistantMessage[]): ConversationState {
  return {
    messages: turn.messages ?? sent,
    proposal: turn.proposal ?? null,
    proposalDisplay: turn.display ?? null,
    preamble: turn.preamble ?? null,
    proposalApplied: false,
  }
}
