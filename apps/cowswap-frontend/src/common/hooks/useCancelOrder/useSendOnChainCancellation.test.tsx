import { PropsWithChildren } from 'react'

import { COW, NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import { renderHook } from '@testing-library/react-hooks'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

import { useEthFlowContract, useGP2SettlementContract } from 'common/hooks/useContract'

import { useSendOnChainCancellation } from './useSendOnChainCancellation'

import { WithMockedWeb3 } from '../../../test-utils'

const chainId = 1
const settlementCancellationTxHash = '0xcfwj23g4fwe111'
const ethFlowCancellationTxHash = '0xcfwj23g4fwe222'

jest.mock('legacy/state/orders/hooks')
jest.mock('@cowprotocol/wallet', () => {
  return {
    ...jest.requireActual('@cowprotocol/wallet'),
    useWalletInfo: jest.fn().mockReturnValue({ chainId }),
  }
})
jest.mock('common/hooks/useContract', () => {
  return {
    ...jest.requireActual('common/hooks/useContract'),
    useEthFlowContract: jest.fn(),
    useGP2SettlementContract: jest.fn(),
  }
})
jest.mock('legacy/state/enhancedTransactions/hooks')
jest.mock('common/hooks/useAnalyticsReporter')

const orderMock = {
  id: 'xx1',
  buyToken: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
  receiver: '0x0000000000000000000000000000000000000000',
  sellAmount: '1',
  buyAmount: '2',
  appData: '0x001',
  validTo: 34245345432,
} as Order

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

const setOrderCancellationHash = jest.fn()
const mockUseSetOrderCancellationHash = useSetOrderCancellationHash as jest.MockedFunction<
  typeof useSetOrderCancellationHash
>
const requestOrderCancellation = jest.fn()
const mockUseRequestOrderCancellation = useRequestOrderCancellation as jest.MockedFunction<
  typeof useRequestOrderCancellation
>
const transactionAdder = jest.fn()
const mockUseTransactionAdder = useTransactionAdder as jest.MockedFunction<typeof useTransactionAdder>

const mockUseEthFlowContract = useEthFlowContract as jest.MockedFunction<typeof useEthFlowContract>
const mockUseGP2SettlementContract = useGP2SettlementContract as jest.MockedFunction<typeof useGP2SettlementContract>

const ethFlowInvalidationMock = jest.fn()
const settlementInvalidationMock = jest.fn()

const WithProviders = ({ children }: PropsWithChildren) => {
  return <WithMockedWeb3>{children}</WithMockedWeb3>
}

describe('useSendOnChainCancellation() + useGetOnChainCancellation()', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ chainId })
    mockUseSetOrderCancellationHash.mockReturnValue(setOrderCancellationHash)
    mockUseRequestOrderCancellation.mockReturnValue(requestOrderCancellation)
    mockUseTransactionAdder.mockReturnValue(transactionAdder)

    ethFlowInvalidationMock.mockResolvedValue({ hash: ethFlowCancellationTxHash })

    mockUseEthFlowContract.mockReturnValue({
      estimateGas: {
        invalidateOrder: () => Promise.resolve(BigNumber.from(100)),
      },
      invalidateOrder: ethFlowInvalidationMock,
    } as any)

    settlementInvalidationMock.mockResolvedValue({ hash: settlementCancellationTxHash })

    mockUseGP2SettlementContract.mockReturnValue({
      estimateGas: {
        invalidateOrder: () => Promise.resolve(BigNumber.from(200)),
      },
      invalidateOrder: settlementInvalidationMock,
    } as any)
  })

  afterEach(() => {
    settlementInvalidationMock.mockClear()
    ethFlowInvalidationMock.mockClear()
  })

  it('When is ETH-flow order, then should call eth-flow contract', async () => {
    const { result } = renderHook(() => useSendOnChainCancellation(), { wrapper: WithProviders })

    await result.current({ ...orderMock, inputToken: NATIVE_CURRENCIES[chainId] })

    expect(ethFlowInvalidationMock).toHaveBeenCalledTimes(1)
    expect(ethFlowInvalidationMock.mock.calls[0]).toMatchSnapshot()
    expect(transactionAdder.mock.calls[0][0].hash).toBe(ethFlowCancellationTxHash)
  })

  it('When is NOT ETH-flow order, then should call settlement contract', async () => {
    const { result } = renderHook(() => useSendOnChainCancellation(), { wrapper: WithProviders })

    await result.current({ ...orderMock, inputToken: COW[chainId] })

    expect(settlementInvalidationMock).toHaveBeenCalledTimes(1)
    expect(settlementInvalidationMock.mock.calls[0]).toMatchSnapshot()
    expect(transactionAdder.mock.calls[0][0].hash).toBe(settlementCancellationTxHash)
  })

  describe('When a transaction is sent', () => {
    it('Then should change an order status, set a tx hash to order and add the transaction to store', async () => {
      const { result } = renderHook(() => useSendOnChainCancellation(), { wrapper: WithProviders })

      await result.current({ ...orderMock, inputToken: COW[chainId] })

      expect(transactionAdder).toHaveBeenCalledTimes(1)
      expect(transactionAdder.mock.calls[0]).toMatchSnapshot()
      expect(requestOrderCancellation).toHaveBeenCalledTimes(1)
      expect(requestOrderCancellation.mock.calls[0]).toMatchSnapshot()
      expect(setOrderCancellationHash).toHaveBeenCalledTimes(1)
      expect(setOrderCancellationHash.mock.calls[0]).toMatchSnapshot()
    })
  })
})
