import { useEffect } from 'react'
import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'
import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useWalletInfo } from '@cowprotocol/wallet'

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
      console.log(`fuck:useResetRecipient`, { hasRecipientInUrl, isAlternativeOrderModalVisible })
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Reset recipient whenever chainId changes
   */
  useEffect(() => {
    onChangeRecipient(null)
  }, [chainId])

  return null
}
