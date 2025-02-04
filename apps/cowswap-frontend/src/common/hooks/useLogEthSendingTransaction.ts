export interface EthSendingTransactionInfo {
  txHash: string
  chainId: number
  urlChainId: number | null
  amount: string
  account: string
}

// TODO: add logging to Sentry
export function useLogEthSendingTransaction() {
  return (info: EthSendingTransactionInfo) => {
    console.log('useLogEthSendingTransaction', info)
  }
}
