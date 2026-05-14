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

  const prevTargetChainId = useRef<TargetChainId | undefined>(undefined)
  useEffect(() => {
    const prev = prevTargetChainId.current
    prevTargetChainId.current = targetChainId

    // Skip the initial `undefined -> chainId` transition: that's app init, not a
    // user-driven chain change, and treating it as one wipes a URL-provided recipient.
    if (prev === undefined) return

    const { recipient: currentRecipient, onChangeRecipient: onChange } = stableRef.current
    if (currentRecipient && !getAddressValidationStrategy(targetChainId).isValidAddress(currentRecipient)) {
      onChange(null)
    }
  }, [targetChainId])
}
