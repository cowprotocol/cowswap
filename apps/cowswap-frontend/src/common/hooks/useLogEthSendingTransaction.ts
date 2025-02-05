import type { PopulatedTransaction } from '@ethersproject/contracts'

import { captureEvent } from '@sentry/browser'

export interface EthSendingTransactionInfo {
  txHash: string
  chainId: number
  urlChainId: number | null
  amount: string
  account: string
  tx: PopulatedTransaction
}

function logEthSendingTransaction(info: EthSendingTransactionInfo) {
  captureEvent({
    message: 'Native token sending transaction',
    level: 'log',
    extra: {
      txHash: info.txHash,
      chainId: info.chainId.toString(),
      urlChainId: String(info.urlChainId),
      amount: info.amount,
      account: info.account,
      txTo: info.tx.to,
      txFrom: info.tx.from,
      txNonce: info.tx.nonce?.toString(),
      txData: info.tx.data,
      txGasLimit: info.tx.gasLimit?.toString(),
      txGasPrice: info.tx.gasPrice?.toString(),
      txType: info.tx.type?.toString(),
    },
  })
}

export function useLogEthSendingTransaction() {
  return logEthSendingTransaction
}
