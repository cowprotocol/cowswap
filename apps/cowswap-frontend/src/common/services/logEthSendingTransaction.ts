import { captureEvent } from '@sentry/browser'
import { SentryEvents } from 'cow-react/sentry/events'

import type { TransactionRequest } from 'viem'

export interface EthSendingIntentionInfo {
  chainId: number
  urlChainId: number | null
  amount: string
  account: string
  tx: TransactionRequest
}

export function logEthSendingIntention(info: EthSendingIntentionInfo): string {
  return captureEvent({
    message: SentryEvents.NATIVE_TOKEN_SENDING_INTENTION,
    level: 'log',
    extra: {
      chainId: info.chainId.toString(),
      urlChainId: String(info.urlChainId),
      amount: info.amount,
      account: info.account,
      txTo: info.tx.to,
      txFrom: info.tx.from,
      txNonce: info.tx.nonce?.toString(),
      txData: info.tx.data,
      txGasLimit: info.tx.gas?.toString(),
      txGasPrice: info.tx.gasPrice?.toString(),
      txType: info.tx.type?.toString(),
    },
  })
}

export function logEthSendingTransaction(extra: { txHash: string; intentionEventId: string }): string {
  return captureEvent({
    message: SentryEvents.NATIVE_TOKEN_SENDING_TRANSACTION,
    level: 'log',
    extra,
  })
}
