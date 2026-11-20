import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { act, renderHook } from '@testing-library/react'
import { buildSolanaReclaimOrderParams } from 'tradingSdk/solana/buildSolanaReclaimOrderParams'
import { solanaTradingSdk } from 'tradingSdk/solanaTradingSdk'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction'

import { useSolanaReclaimRent } from './useSolanaReclaimRent'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const chainId = 7565164
const orderId = '0x1f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const orderToReclaim = { id: orderId, placedAt: Date.now() - 60 * 60 * 1000 }
const txHash = 'solanaReclaimTxHash'

jest.mock('tradingSdk/solanaTradingSdk', () => ({
  SOLANA_TRADING_ENV: 'prod',
  solanaTradingSdk: { reclaimOrders: jest.fn() },
}))
jest.mock('@cowprotocol/wallet', () => ({
  useSolanaWalletProvider: jest.fn(),
  useWalletInfo: jest.fn(),
}))
jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: jest.fn() }))
jest.mock('legacy/state/enhancedTransactions/hooks')
jest.mock('modules/trade/services/solanaSend/sendSolanaTransaction')
jest.mock('tradingSdk/solana/buildSolanaReclaimOrderParams')

const mockUseSolanaWalletProvider = useSolanaWalletProvider as jest.MockedFunction<typeof useSolanaWalletProvider>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseAppKitConnection = useAppKitConnection as jest.MockedFunction<typeof useAppKitConnection>
const mockSendSolanaTransaction = sendSolanaTransaction as jest.MockedFunction<typeof sendSolanaTransaction>
const mockBuildSolanaReclaimOrderParams = buildSolanaReclaimOrderParams as jest.MockedFunction<
  typeof buildSolanaReclaimOrderParams
>
const mockReclaimOrders = solanaTradingSdk.reclaimOrders as jest.MockedFunction<typeof solanaTradingSdk.reclaimOrders>

const transactionAdder = jest.fn()
const provider = {} as SolanaProvider
const connection = {} as Connection
const orderPda = new PublicKey('So11111111111111111111111111111111111111112')
const instruction = { keys: [], programId: orderPda, data: Buffer.from([5]) } as TransactionInstruction

describe('useSolanaReclaimRent', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ account: SOLANA_ACCOUNT, chainId } as ReturnType<typeof useWalletInfo>)
    mockUseSolanaWalletProvider.mockReturnValue(provider)
    mockUseAppKitConnection.mockReturnValue({ connection } as ReturnType<typeof useAppKitConnection>)
    mockSendSolanaTransaction.mockResolvedValue({ hash: txHash, lastValidBlockHeight: 100 })
    mockBuildSolanaReclaimOrderParams.mockImplementation(async (_connection, ownerAddress, orders) =>
      orders.map(({ id }) => ({ id, params: { ownerAddress, orderPda } })),
    )
    mockReclaimOrders.mockReturnValue([instruction])
    ;(useTransactionAdder as jest.Mock).mockReturnValue(transactionAdder)
  })

  it('sends the reclaim instructions and records the transaction', async () => {
    const { result } = renderHook(() => useSolanaReclaimRent())

    await act(async () => {
      await result.current([orderToReclaim])
    })

    expect(mockBuildSolanaReclaimOrderParams).toHaveBeenCalledWith(
      connection,
      expect.any(PublicKey),
      [orderToReclaim],
      'prod',
    )
    expect(mockReclaimOrders).toHaveBeenCalledWith([{ ownerAddress: expect.any(PublicKey), orderPda }])
    expect(mockSendSolanaTransaction).toHaveBeenCalledWith(connection, provider, expect.any(PublicKey), [instruction])
    expect(transactionAdder).toHaveBeenCalledWith({ hash: txHash, summary: expect.any(String) })
  })

  it('throws without sending when the rent is already gone', async () => {
    mockBuildSolanaReclaimOrderParams.mockResolvedValue([])

    const { result } = renderHook(() => useSolanaReclaimRent())

    await expect(result.current([orderToReclaim])).rejects.toThrow('There is no rent left to reclaim')
    expect(mockSendSolanaTransaction).not.toHaveBeenCalled()
  })

  it('throws without a connected Solana wallet', async () => {
    mockUseSolanaWalletProvider.mockReturnValue(undefined)

    const { result } = renderHook(() => useSolanaReclaimRent())

    await expect(result.current([orderToReclaim])).rejects.toThrow('Wallet not connected')
    expect(mockSendSolanaTransaction).not.toHaveBeenCalled()
  })
})
