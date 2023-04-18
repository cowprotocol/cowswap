import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { BigNumber } from '@ethersproject/bignumber'
import { NativeCurrency } from '@uniswap/sdk-core'
import { MAINNET_NATIVE_CURRENCY } from 'lib/hooks/useNativeCurrency'

export type CancellationType = 'offChain' | 'onChain'

export type CancellationModalContext = {
  chainId: number | null
  orderId: string | null
  summary: string | undefined | null
  error: string | null
  txCost: BigNumber | null
  nativeCurrency: NativeCurrency
  isPendingSignature: boolean
  onDismiss: (() => void) | null
  triggerCancellation: ((type: CancellationType) => Promise<void>) | null
  defaultType: CancellationType
}

const defaultCancellationModalContext: CancellationModalContext = {
  chainId: null,
  orderId: null,
  summary: null,
  error: null,
  txCost: null,
  nativeCurrency: MAINNET_NATIVE_CURRENCY,
  isPendingSignature: false,
  onDismiss: null,
  triggerCancellation: null,
  defaultType: 'offChain',
}

export const cancellationModalContextAtom = atomWithReset<CancellationModalContext>(defaultCancellationModalContext)

export const updateCancellationModalContextAtom = atom(
  null,
  (get, set, nextState: Partial<CancellationModalContext>) => {
    set(cancellationModalContextAtom, () => {
      const prevState = get(cancellationModalContextAtom)

      return { ...prevState, ...nextState }
    })
  }
)
