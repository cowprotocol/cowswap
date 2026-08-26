import { atom } from 'jotai'

import { AssistantMessage, AssistantProposal } from '../types'

export interface ConversationState {
  /** Set only when the model proposed a trade without a word of its own. */
  preamble: string | null
  proposal: AssistantProposal | null
  proposalApplied: boolean
  proposalDisplay: { buySymbol: string; sellSymbol: string } | null
  /** Full history, resent every turn — the backend keeps nothing. */
  messages: AssistantMessage[]
}

export const EMPTY_CONVERSATION: ConversationState = {
  messages: [],
  proposal: null,
  proposalDisplay: null,
  preamble: null,
  proposalApplied: false,
}

/**
 * The transcript lives in an atom, not in the drawer's own state.
 *
 * The drawer renders `null` when closed, which unmounts it — component state would
 * take the conversation with it, so closing the panel to look at the form would
 * silently throw away everything that had been said.
 */
export const conversationAtom = atom<ConversationState>(EMPTY_CONVERSATION)
