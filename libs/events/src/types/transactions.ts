export type OnTransactionPayload = {
  receipt: {
    to: string
    from: string
    contractAddress: string
    transactionHash: string
    blockNumber: number
    status?: number
    replacementType?: 'speedup' | 'cancel'
  }
  summary: string
}
