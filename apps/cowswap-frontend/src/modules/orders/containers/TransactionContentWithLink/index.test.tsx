import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'

import { render } from '@testing-library/react'

import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { TransactionContentWithLink } from './index'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
  useGnosisSafeInfo: jest.fn(),
}))

// Capture the `tx` object passed to EnhancedTransactionLink so we can assert on what
// kind of link TransactionContentWithLink decided to build.
// Must be `mock`-prefixed to be referenced inside the jest.mock() factory.
const mockEnhancedTransactionLink = jest.fn()
jest.mock('legacy/components/EnhancedTransactionLink', () => ({
  EnhancedTransactionLink: (props: unknown) => {
    mockEnhancedTransactionLink(props)
    return null
  },
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useGnosisSafeInfoMock = useGnosisSafeInfo as jest.MockedFunction<typeof useGnosisSafeInfo>

const SAFE_ADDRESS = '0x8FAb71C0d4272698A3B2d1F3Ed5FC3c1B9b3E531'
// An on-chain Ethereum transaction hash, as reported for an immediately-executed
// approve/wrap/unwrap transaction (e.g. a 1/1 Safe). This is NOT a safeTxHash.
const ONCHAIN_TX_HASH = '0x54a982fbce9ba5bc9287dfcbf9c19ad2449334e29657dd58d0fdb31c4ca9731e'
// A genuine Safe transaction hash returned by the Safe Transaction Service.
const SAFE_TX_HASH = '0x' + 'a'.repeat(64)

function getRenderedTx(): { hash: string; hashType: HashType; safeTransaction: { safe: string; safeTxHash: string } } {
  return mockEnhancedTransactionLink.mock.calls[0][0].tx
}

function renderComponent(props: Parameters<typeof TransactionContentWithLink>[0]): void {
  render(<TransactionContentWithLink {...props} />)
}

describe('TransactionContentWithLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useWalletInfoMock.mockReturnValue({
      account: SAFE_ADDRESS,
      chainId: 1,
    } as ReturnType<typeof useWalletInfo>)
  })

  describe('when the connected wallet is a Safe', () => {
    beforeEach(() => {
      useGnosisSafeInfoMock.mockReturnValue({
        address: SAFE_ADDRESS,
        chainId: 1,
        threshold: 1,
        owners: [SAFE_ADDRESS],
        nonce: 0,
      })
    })

    it('treats an on-chain tx hash as an Ethereum tx when isSafeTx is false (no 404 Safe link)', () => {
      // approve/wrap/unwrap executed directly: the event reports an on-chain hash and isSafeTx=false
      renderComponent({ transactionHash: ONCHAIN_TX_HASH, isSafeTx: false })

      const tx = getRenderedTx()
      expect(tx.hashType).toBe(HashType.ETHEREUM_TX)
      expect(tx.hash).toBe(ONCHAIN_TX_HASH)
    })

    it('treats the hash as a Safe tx when isSafeTx is true', () => {
      renderComponent({ transactionHash: SAFE_TX_HASH, isSafeTx: true })

      const tx = getRenderedTx()
      expect(tx.hashType).toBe(HashType.GNOSIS_SAFE_TX)
      expect(tx.safeTransaction).toEqual({ safeTxHash: SAFE_TX_HASH, safe: SAFE_ADDRESS })
    })

    it('falls back to the Safe-wallet heuristic when isSafeTx is not provided', () => {
      renderComponent({ transactionHash: SAFE_TX_HASH })

      const tx = getRenderedTx()
      expect(tx.hashType).toBe(HashType.GNOSIS_SAFE_TX)
    })
  })

  describe('when the connected wallet is an EOA', () => {
    beforeEach(() => {
      useGnosisSafeInfoMock.mockReturnValue(undefined)
    })

    it('treats an on-chain tx hash as an Ethereum tx', () => {
      renderComponent({ transactionHash: ONCHAIN_TX_HASH })

      const tx = getRenderedTx()
      expect(tx.hashType).toBe(HashType.ETHEREUM_TX)
      expect(tx.hash).toBe(ONCHAIN_TX_HASH)
    })
  })
})
