import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const hasRecipientInUrl = !!tradeStateFromUrl.recipient
  const { chainId } = useWalletInfo()

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl && !isAlternativeOrderModalVisible) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Reset recipient whenever chainId changes
   */
  useEffect(() => {
    onChangeRecipient(null)
  }, [chainId, onChangeRecipient])

  return null
}
