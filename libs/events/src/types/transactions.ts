import type { TransactionReceipt } from 'viem'

export type OnTransactionPayload = {
  receipt: Pick<
    TransactionReceipt,
    'blockNumber' | 'contractAddress' | 'from' | 'status' | 'to' | 'transactionHash'
  > & {
    replacementType?: 'speedup' | 'cancel' | 'replaced'
  }
  summary: string
}
