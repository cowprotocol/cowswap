import { SigningScheme } from '@cowprotocol/cow-sdk'
import { findOrderPda, getSolanaSettlementProgramId, SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey, Connection } from '@solana/web3.js'
import { act, renderHook } from '@testing-library/react'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { OrderStatus } from 'legacy/state/orders/actions'
import { useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction'

import { CancellableOrder } from 'common/utils/isOrderCancellable'

import { useSolanaCancelMultipleOrders } from './useSolanaCancelMultipleOrders'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const chainId = 7565164
const txHash = 'solanaBatchTxHash'

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

const setOrderCancellationHash = jest.fn()
const transactionAdder = jest.fn()
const mockCancelOrders = jest.fn()

const provider = {} as SolanaProvider
const connection = {} as Connection
const orderPda = new PublicKey('So11111111111111111111111111111111111111112')
const instructions = [
  { keys: [], programId: orderPda, data: Buffer.from([1]) },
  { keys: [], programId: orderPda, data: Buffer.from([2]) },
] as ReturnType<typeof SolanaTradingSdk.prototype.cancelOrders>

function makeOrder(id: string): CancellableOrder {
  return {
    id,
    inputToken: { symbol: 'USDC' } as CancellableOrder['inputToken'],
    signingScheme: SigningScheme.PRESIGN,
    status: OrderStatus.PENDING,
  }
}

const orderA = makeOrder('0x1f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f')
const orderB = makeOrder('0x2f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f')

describe('useSolanaCancelMultipleOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ account: SOLANA_ACCOUNT, chainId } as ReturnType<typeof useWalletInfo>)
    mockUseSolanaWalletProvider.mockReturnValue(provider)
    mockUseAppKitConnection.mockReturnValue({ connection } as ReturnType<typeof useAppKitConnection>)
    mockSendSolanaTransaction.mockResolvedValue({ hash: txHash, lastValidBlockHeight: 100 })
    mockFindOrderPda.mockReturnValue([orderPda, 255])
    mockGetSolanaSettlementProgramId.mockReturnValue(orderPda)
    mockCancelOrders.mockReturnValue(instructions)
    MockSolanaTradingSdk.mockImplementation(() => ({ cancelOrders: mockCancelOrders }) as unknown as SolanaTradingSdk)
    ;(useSetOrderCancellationHash as jest.Mock).mockReturnValue(setOrderCancellationHash)
    ;(useTransactionAdder as jest.Mock).mockReturnValue(transactionAdder)
  })

  it('bundles one CancelOrder instruction per order into a single transaction', async () => {
    const { result } = renderHook(() => useSolanaCancelMultipleOrders())

    await act(async () => {
      await result.current([orderA, orderB])
    })

    expect(mockCancelOrders).toHaveBeenCalledWith([
      expect.objectContaining({ orderPda, ownerAddress: expect.any(PublicKey) }),
      expect.objectContaining({ orderPda, ownerAddress: expect.any(PublicKey) }),
    ])
    expect(mockSendSolanaTransaction).toHaveBeenCalledWith(connection, provider, expect.any(PublicKey), instructions)

    expect(setOrderCancellationHash).toHaveBeenCalledTimes(2)
    expect(setOrderCancellationHash).toHaveBeenCalledWith({ chainId, id: orderA.id, hash: txHash })
    expect(setOrderCancellationHash).toHaveBeenCalledWith({ chainId, id: orderB.id, hash: txHash })
    expect(transactionAdder).toHaveBeenCalledWith({ hash: txHash, summary: 'Cancel 2 orders' })
  })

  it('throws without sending when an order is not cancellable', async () => {
    const { result } = renderHook(() => useSolanaCancelMultipleOrders())
    const cancelledOrder = { ...orderA, status: OrderStatus.FULFILLED }

    await expect(result.current([cancelledOrder])).rejects.toThrow('Some orders can not be cancelled!')
    expect(mockSendSolanaTransaction).not.toHaveBeenCalled()
  })

  it('throws without a connected Solana wallet', async () => {
    mockUseSolanaWalletProvider.mockReturnValue(undefined)

    const { result } = renderHook(() => useSolanaCancelMultipleOrders())

    await expect(result.current([orderA])).rejects.toThrow('Wallet not connected')
    expect(mockSendSolanaTransaction).not.toHaveBeenCalled()
  })
})
