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

  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }
    const { recipient: currentRecipient, onChangeRecipient: onChange } = stableRef.current
    if (currentRecipient && !getAddressValidationStrategy(targetChainId).isValidAddress(currentRecipient)) {
      onChange(null)
    }
  }, [targetChainId])
}
