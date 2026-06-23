import { useEffect, useLayoutEffect, useRef } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'

import { getAddressValidationStrategy } from 'common/utils/addressValidation'

/**
 * Resets the recipient address when the destination chain changes,
 * but only if the current address is invalid for the new chain.
 * e.g. SOL -> BTC resets, EVM -> EVM does not.
 */
export function useResetRecipientOnChainChange(
  targetChainId: TargetChainId | undefined,
  recipient: string,
  onChangeRecipient: (recipient: string | null) => void,
): void {
  const stableRef = useRef({ onChangeRecipient, recipient })
  useLayoutEffect(() => {
    stableRef.current.onChangeRecipient = onChangeRecipient
    stableRef.current.recipient = recipient
  })

  const hasInitialized = useRef(false)
  useEffect(() => {
    // Absorb the initial hydration (`undefined -> chainId` at app start) exactly once:
    // that's app init, not a user-driven chain change, and treating it as one wipes a
    // URL-provided recipient. After the first defined chain is seen, validate every
    // subsequent change — including later `undefined -> chainId` transitions, e.g. the
    // buy token being cleared and then a non-EVM chain (BTC/SOL) selected.
    if (!hasInitialized.current) {
      if (targetChainId !== undefined) {
        hasInitialized.current = true
      }
      return
    }

    const { recipient: currentRecipient, onChangeRecipient: onChange } = stableRef.current
    if (currentRecipient && !getAddressValidationStrategy(targetChainId).isValidAddress(currentRecipient)) {
      onChange(null)
    }
  }, [targetChainId])
}
