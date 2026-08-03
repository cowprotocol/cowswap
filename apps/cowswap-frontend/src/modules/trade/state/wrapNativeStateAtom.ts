import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

interface WrapNativeState {
  isOpen: boolean
  errorMessage?: string
  /**
   * The amounts the owner will actually send and receive, when known ahead of signing (Solana only, for
   * now — see `solanaWrapUnwrapCallback`). Undefined means "assume it matches the typed input", which
   * is always true for EVM wrap/unwrap.
   */
  sendAmount?: CurrencyAmount<Currency>
  receiveAmount?: CurrencyAmount<Currency>
}

export const wrapNativeStateAtom = atom<WrapNativeState>({
  isOpen: false,
})
