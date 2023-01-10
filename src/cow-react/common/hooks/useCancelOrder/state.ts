import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export type CancellationModalContext = {
  chainId: number | null
  orderId: string | null
  summary: string | undefined | null
  error: string | null
  isPendingSignature: boolean
  onDismiss: (() => void) | null
  triggerCancellation: (() => Promise<void>) | null
  type: 'offChain' | 'ethFlow' | null
}

const defaultCancellationModalContext: CancellationModalContext = {
  chainId: null,
  orderId: null,
  summary: null,
  error: null,
  isPendingSignature: false,
  onDismiss: null,
  triggerCancellation: null,
  type: null,
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
