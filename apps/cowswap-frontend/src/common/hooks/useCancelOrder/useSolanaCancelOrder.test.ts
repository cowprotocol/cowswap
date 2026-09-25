import { findOrderPda, getSolanaSettlementProgramId, SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey, Connection } from '@solana/web3.js'
import { act, renderHook } from '@testing-library/react'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction'

import { useSolanaCancelOrder } from './useSolanaCancelOrder'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const chainId = 7565164
const orderId = '0x1f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const txHash = 'solanaTxHash123'

// The SDK's own crypto (PDA derivation, instruction encoding) is covered by its own test suite -
// this test only verifies the hook wires the SDK and the wallet/Redux/tx-store glue correctly.
jest.mock('@cowprotocol/sdk-trading-solana')
jest.mock('@cowprotocol/wallet', () => ({
  useSolanaWalletProvider: jest.fn(),
  useWalletInfo: jest.fn(),
}))
jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: jest.fn() }))
jest.mock('legacy/state/orders/hooks')
jest.mock('legacy/state/enhancedTransactions/hooks')
jest.mock('modules/trade/services/solanaSend/sendSolanaTransaction')

const mockUseSolanaWalletProvider = useSolanaWalletProvider as jest.MockedFunction<typeof useSolanaWalletProvider>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseAppKitConnection = useAppKitConnection as jest.MockedFunction<typeof useAppKitConnection>
const mockSendSolanaTransaction = sendSolanaTransaction as jest.MockedFunction<typeof sendSolanaTransaction>
const mockFindOrderPda = findOrderPda as jest.MockedFunction<typeof findOrderPda>
const mockGetSolanaSettlementProgramId = getSolanaSettlementProgramId as jest.MockedFunction<
  typeof getSolanaSettlementProgramId
>
const MockSolanaTradingSdk = SolanaTradingSdk as jest.MockedClass<typeof SolanaTradingSdk>

const requestOrderCancellation = jest.fn()
const setOrderCancellationHash = jest.fn()
const transactionAdder = jest.fn()
const mockCancelOrder = jest.fn()

const provider = {} as SolanaProvider
const connection = {} as Connection
const orderPda = new PublicKey('So11111111111111111111111111111111111111112')
const instruction = { keys: [], programId: orderPda, data: Buffer.from([]) } as ReturnType<
  typeof SolanaTradingSdk.prototype.cancelOrder
>

const orderMock = {
  id: orderId,
  inputToken: { symbol: 'USDC' },
} as Order

describe('useSolanaCancelOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ account: SOLANA_ACCOUNT, chainId } as ReturnType<typeof useWalletInfo>)
    mockUseSolanaWalletProvider.mockReturnValue(provider)
    mockUseAppKitConnection.mockReturnValue({ connection } as ReturnType<typeof useAppKitConnection>)
    mockSendSolanaTransaction.mockResolvedValue({ hash: txHash, lastValidBlockHeight: 100 })
    mockFindOrderPda.mockReturnValue([orderPda, 255])
    mockGetSolanaSettlementProgramId.mockReturnValue(orderPda)
    mockCancelOrder.mockReturnValue(instruction)
    MockSolanaTradingSdk.mockImplementation(() => ({ cancelOrder: mockCancelOrder }) as unknown as SolanaTradingSdk)
    ;(useRequestOrderCancellation as jest.Mock).mockReturnValue(requestOrderCancellation)
    ;(useSetOrderCancellationHash as jest.Mock).mockReturnValue(setOrderCancellationHash)
    ;(useTransactionAdder as jest.Mock).mockReturnValue(transactionAdder)
  })

  it('builds and sends the CancelOrder instruction, then updates order state and the tx store', async () => {
    const { result } = renderHook(() => useSolanaCancelOrder())

    await act(async () => {
      await result.current(orderMock)
    })

    expect(mockCancelOrder).toHaveBeenCalledWith(
      expect.objectContaining({ orderPda, ownerAddress: expect.any(PublicKey) }),
    )
    expect((mockCancelOrder.mock.calls[0][0].ownerAddress as PublicKey).toBase58()).toBe(SOLANA_ACCOUNT)

    expect(mockSendSolanaTransaction).toHaveBeenCalledWith(connection, provider, expect.any(PublicKey), [instruction])

    expect(requestOrderCancellation).toHaveBeenCalledWith({ id: orderId, chainId })
    expect(setOrderCancellationHash).toHaveBeenCalledWith({ chainId, id: orderId, hash: txHash })
    expect(transactionAdder).toHaveBeenCalledWith({
      hash: txHash,
      summary: expect.stringContaining('Cancel order'),
      onChainCancellation: { orderId, sellTokenSymbol: 'USDC' },
    })
  })

  it('throws without a connected Solana wallet', async () => {
    mockUseSolanaWalletProvider.mockReturnValue(undefined)

    const { result } = renderHook(() => useSolanaCancelOrder())

    await expect(result.current(orderMock)).rejects.toThrow('Solana wallet not connected')
    expect(mockSendSolanaTransaction).not.toHaveBeenCalled()
  })
})
