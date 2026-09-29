import { act, renderHook, waitFor } from '@testing-library/react'

import { WithMockedWeb3 } from '../../../../test-utils'
import { HashType } from '../reducer'

import { useAllTransactions, useTransactionAdder } from './index'

const SIGNATURE = '5x8VXqZ8pQ2mJ7Yb1kL3nR4tW6uH9dF2sG5cA7eB1vN3mK4pQ8rT2yU6iO9aS1dF'

jest.mock('@cowprotocol/wallet', () => {
  // Values are inlined: jest.mock factories are hoisted above the module scope.
  const { SupportedChainId } = jest.requireActual('@cowprotocol/cow-sdk')

  return {
    ...jest.requireActual('@cowprotocol/wallet'),
    useWalletInfo: jest.fn().mockReturnValue({
      chainId: SupportedChainId.SOLANA,
      account: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    }),
    useIsSafeWallet: jest.fn().mockReturnValue(false),
  }
})

// Solana has no nonce, so wagmi cannot serve this request for a Solana chain id.
jest.mock('wagmi/actions', () => ({
  getTransactionCount: jest.fn().mockRejectedValue(new Error('Chain not configured')),
}))

describe('useTransactionAdder on Solana', () => {
  it('stores the transaction even though the EVM nonce lookup is unavailable', async () => {
    const { result } = renderHook(() => ({ add: useTransactionAdder(), transactions: useAllTransactions() }), {
      wrapper: WithMockedWeb3,
    })

    await act(async () => {
      await result.current.add({ hash: SIGNATURE, summary: 'Wrap 1 SOL to WSOL' })
    })

    await waitFor(() => {
      expect(result.current.transactions[SIGNATURE]).toBeDefined()
    })

    expect(result.current.transactions[SIGNATURE]).toMatchObject({
      hashType: HashType.SOLANA_TX,
      // Solana signatures are final the moment the wallet returns them, unlike a Safe tx hash
      transactionHash: SIGNATURE,
      summary: 'Wrap 1 SOL to WSOL',
    })
  })
})
