import { atom } from 'jotai'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

export interface LimitOrderDraft {
  inputAmount: CurrencyAmount<Token>
  outputCurrency: Token
  price?: { type: 'percentage'; value: string } | { type: 'custom' }
}

export interface PendingLimitOrderDraft {
  draft: LimitOrderDraft
  pathname: string
  account: string | undefined
}

export const pendingLimitOrderDraftAtom = atom<PendingLimitOrderDraft | null>(null)
