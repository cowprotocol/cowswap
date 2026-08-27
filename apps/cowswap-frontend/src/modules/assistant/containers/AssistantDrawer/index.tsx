import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import Close from '@cowprotocol/assets/images/x.svg?react'
import { useBodyScrollbarLocker, useMediaQuery } from '@cowprotocol/common-hooks'
import { ALL_SUPPORTED_CHAINS_MAP } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ChatIcon } from './ChatIcon'
import * as styledEl from './styled'

import { useAssistantContext } from '../../hooks/useAssistantContext'
import { useAssistantDrawer } from '../../hooks/useAssistantDrawer'
import { useConfirmProposal } from '../../hooks/useConfirmProposal'
import { FILL_MARKER, isAppInjected, QUOTE_MARKER, useConversation, WRAP_MARKER } from '../../hooks/useConversation'
import { useFillWatch } from '../../hooks/useFillWatch'
import { useProposalLanded } from '../../hooks/useProposalLanded'
import { useQuoteWatch } from '../../hooks/useQuoteWatch'
import { useWrapWatch } from '../../hooks/useWrapWatch'
import { MessageList, VisibleMessage } from '../../pure/MessageList'
import { ProposalCard } from '../../pure/ProposalCard'
import { conversationAtom } from '../../state/conversationAtom'
import { AssistantMessage, AssistantUiContext } from '../../types'
import { AssistantComposer } from '../AssistantComposer'

const GREETING = `Tell me what you'd like to trade — in plain language. I'll set it up in the form for you to check, and I can answer questions about how CoW works.`

/**
 * The assistant panel.
 *
 * Renders nothing at all when closed, so the app is what it is today for anyone who
 * never opens it.
 *
 * Mounted at AppContainer rather than inside a routed page, and that placement is
 * load-bearing: applying a proposal NAVIGATES (the trade is expressed as a URL), so
 * a panel inside the trade page would unmount mid-conversation every time the
 * assistant filled the form.
 */
export function AssistantDrawer(): ReactNode {
  const { isOpen, close } = useAssistantDrawer()
  const isNarrow = useMediaQuery(Media.upToMedium(false))

  const uiContext = useAssistantContext()
  const { messages, proposal, proposalDisplay, preamble, proposalApplied } = useAtomValue(conversationAtom)
  const { busy, error, status, streamText, send, markApplied } = useConversation()
  const wrapWatch = useWrapWatch()
  const fillWatch = useFillWatch()
  const landed = useProposalLanded(proposal, proposalApplied, uiContext)
  const quoteWatch = useQuoteWatch(uiContext, landed)
  const {
    confirm,
    applying,
    problem: applyProblem,
  } = useConfirmProposal({ markApplied, proposal, quoteWatch, wrapWatch })

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamText, busy, proposal])

  // Only when it's modal. On a wide screen the page behind stays scrollable, because
  // reading the form while talking about it is the point of a drawer.
  useBodyScrollbarLocker(isOpen && isNarrow)

  const onSend = useCallback(
    (text: string, inputMode: NonNullable<AssistantUiContext['inputMode']>) => {
      send(text, { ...uiContext, inputMode })
    },
    [send, uiContext],
  )

  // When a proposed wrap lands on chain, carry straight on to step two rather than
  // leaving the user to work out that they should ask again.
  useEffect(() => {
    if (!wrapWatch.completed || busy) return
    wrapWatch.clear()
    send(WRAP_MARKER, { ...uiContext, inputMode: 'app' })
    // uiContext changes on every quote tick; depending on it would resend the nudge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapWatch.completed, busy])

  // Once the form has priced the applied trade, ask for a comment on it. This is the
  // only point at which the assistant can see what the trade actually costs.
  useEffect(() => {
    if (!quoteWatch.ready || busy) return
    quoteWatch.clear()
    send(QUOTE_MARKER, { ...uiContext, inputMode: 'app' })
    // uiContext changes on every tick; depending on it would resend the nudge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteWatch.ready, busy])

  // Report a settlement once, and only into a conversation that exists — an
  // unprompted "your order filled" in an empty panel is a notification, and the app
  // already has those.
  useEffect(() => {
    if (!fillWatch.fill || busy || messages.length === 0) return
    const fill = fillWatch.fill
    fillWatch.clear()
    send(FILL_MARKER, { ...uiContext, inputMode: 'app', lastFill: fill })
    // uiContext changes every tick; depending on it would resend the nudge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillWatch.fill, busy, messages.length])

  if (!isOpen) return null

  return (
    <>
      <styledEl.Scrim onClick={close} />
      <styledEl.Drawer aria-label="Trade assistant">
        <styledEl.Header>
          <strong>
            <ChatIcon />
            {/* Same word as the toggle: two names for one panel reads as two features. */}
            <Trans>Assistant</Trans>
          </strong>
          <styledEl.CloseButton onClick={close} aria-label="Close the assistant">
            <Close width={18} height={18} />
          </styledEl.CloseButton>
        </styledEl.Header>

        <MessageList
          busy={busy}
          error={error ?? applyProblem}
          greeting={GREETING}
          messages={toVisible(messages)}
          scrollRef={scrollRef}
          status={status}
          streamText={streamText}
        >
          {/* Only ever set when the model proposed a trade without saying anything. */}
          {proposal && preamble && <styledEl.Message from="assistant">{preamble}</styledEl.Message>}

          {proposal && (
            <ProposalCard
              landed={landed}
              chainName={chainNameOf(proposal.chainId)}
              display={proposalDisplay}
              onConfirm={confirm}
              pending={applying}
              proposal={proposal}
            />
          )}
        </MessageList>

        <AssistantComposer busy={busy} onSend={onSend} />
      </styledEl.Drawer>
    </>
  )
}

function chainNameOf(chainId: number | undefined): string {
  const chain = ALL_SUPPORTED_CHAINS_MAP[chainId as keyof typeof ALL_SUPPORTED_CHAINS_MAP]
  return chain?.label ?? String(chainId ?? '')
}

/**
 * The history the backend returns also carries tool_use / tool_result blocks, which
 * exist for the model's context and must be resent, but aren't for reading.
 */
function displayText(message: AssistantMessage): string {
  const { content } = message
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''

  return content
    .filter((block): block is { text: string; type: string } => (block as { type?: string })?.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim()
}

function toVisible(messages: AssistantMessage[]): VisibleMessage[] {
  return messages
    .map((message) => ({ role: message.role, text: displayText(message) }))
    .filter((message) => message.text && !isAppInjected(message.text))
}
