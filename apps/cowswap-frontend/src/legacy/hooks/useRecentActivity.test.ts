import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'

import { isNotOnChainCancellationTx } from './useRecentActivity'

function createTx(overrides: Partial<EnhancedTransactionDetails> = {}): EnhancedTransactionDetails {
  return {
    hash: '0xhash',
    hashType: HashType.ETHEREUM_TX,
    transactionHash: '0xhash',
    nonce: 0,
    addedTime: Date.now(),
    from: '0xfrom',
    ...overrides,
  }
}

describe('isNotOnChainCancellationTx', () => {
  it('is true for a regular transaction', () => {
    expect(isNotOnChainCancellationTx(createTx())).toBe(true)
  })

  it('is false for a single-order EVM/Solana cancellation tx', () => {
    const tx = createTx({ onChainCancellation: { orderId: '0xorder', sellTokenSymbol: 'COW' } })

    expect(isNotOnChainCancellationTx(tx)).toBe(false)
  })

  // Solana has no dedicated batch-cancel instruction, so cancelling several orders bundles one
  // CancelOrder instruction per order into a single transaction - it should be hidden the same way a
  // single-order cancellation is.
  it('is false for a batched Solana cancellation tx', () => {
    const tx = createTx({ solanaCancelOrderIds: ['0xorder1', '0xorder2'] })

    expect(isNotOnChainCancellationTx(tx)).toBe(false)
  })
})
