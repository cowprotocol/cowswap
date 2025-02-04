import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface EthSendingTransactionInfo {
  txHash: string
  uiChainId: SupportedChainId
}

// TODO: add logging to Sentry
export function useLogEthSendingTransaction() {
  return (info: EthSendingTransactionInfo) => {
    console.log('useLogEthSendingTransaction', info)
  }
}
