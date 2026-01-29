import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { isAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { usePostHooksRecipientOverride } from 'entities/orderHooks/usePostHooksRecipientOverride'

import { getChainType } from 'common/chains/nonEvm'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsHooksTradeType } from './useIsHooksTradeType'
import { useIsNativeIn } from './useIsNativeInOrOut'
import { useTradeState } from './useTradeState'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeState = useDerivedTradeState()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const postHooksRecipientOverride = usePostHooksRecipientOverride()
  const isHooksTradeType = useIsHooksTradeType()
  const isNativeIn = useIsNativeIn()
  const hasTradeState = !!tradeStateFromUrl
  const { chainId } = useWalletInfo()
  const { state: tradeRawState } = useTradeState()

  const prevPostHooksRecipientOverride = usePrevious(postHooksRecipientOverride)
  const destinationChainId =
    tradeRawState?.targetChainId ?? tradeState?.outputCurrency?.chainId ?? tradeRawState?.chainId ?? undefined
  const destinationChainType = getChainType(destinationChainId)
  const prevDestinationChainId = usePrevious(destinationChainId)
  const prevDestinationChainType = usePrevious(destinationChainType)
  const recipient = tradeState?.recipient
  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl && !isAlternativeOrderModalVisible && !postHooksRecipientOverride) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTradeState])

  /**
   * Reset recipient whenever chainId changes
   */
  useEffect(() => {
    if (!postHooksRecipientOverride) {
      onChangeRecipient(null)
    }
  }, [chainId, onChangeRecipient, postHooksRecipientOverride])

  /**
   * Remove recipient override when its source hook was deleted
   */
  useEffect(() => {
    const recipientOverrideWasRemoved = !postHooksRecipientOverride && recipient === prevPostHooksRecipientOverride

    if (recipientOverrideWasRemoved) {
      onChangeRecipient(null)
    }
  }, [recipient, postHooksRecipientOverride, prevPostHooksRecipientOverride, isNativeIn, onChangeRecipient])

  /**
   * Remove recipient when going out from hooks-store page
   */
  useEffect(() => {
    if (!isHooksTradeType) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, onChangeRecipient])

  useEffect(() => {
    if (isHooksTradeType && isNativeIn) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, isNativeIn, onChangeRecipient])

  /**
   * Apply recipient reset rules when the destination chain changes.
   * - Non-EVM -> EVM: keep only valid EVM addresses.
   * - Bitcoin <-> Solana: always clear.
   * - EVM -> Non-EVM: clear.
   */
  useEffect(() => {
    if (!prevDestinationChainId || prevDestinationChainId === destinationChainId) return

    const prevType = prevDestinationChainType ?? getChainType(prevDestinationChainId)
    const nextType = destinationChainType

    if (prevType !== 'evm' && nextType === 'evm') {
      if (recipient && isAddress(recipient)) {
        return
      }
    } else if (prevType === 'evm' && nextType === 'evm') {
      return
    }

    onChangeRecipient(null)
  }, [
    prevDestinationChainId,
    prevDestinationChainType,
    destinationChainId,
    destinationChainType,
    recipient,
    onChangeRecipient,
  ])

  return null
}
