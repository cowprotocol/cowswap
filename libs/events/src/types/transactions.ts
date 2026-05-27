export type OnTransactionPayload = {
  receipt: {
    to: string
    from: string
    contractAddress: string
    transactionHash: string
    blockNumber: number
    status?: number
    replacementType?: 'speedup' | 'cancel' | 'replaced'
  }
  summary: string
  /**
   * True when `receipt.transactionHash` is a Safe transaction hash (safeTxHash) rather than
   * an on-chain Ethereum transaction hash. Only Safe transaction hashes can be used to build
   * a working `app.safe.global` deep link.
   */
  isSafeTx?: boolean
}
