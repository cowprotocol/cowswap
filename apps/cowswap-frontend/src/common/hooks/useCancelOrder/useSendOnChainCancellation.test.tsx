import { PropsWithChildren } from 'react'

import { COW_TOKEN_TO_CHAIN, NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import { act, renderHook } from '@testing-library/react'
import { writeContract } from 'wagmi/actions'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

import { useEthFlowContract } from 'common/hooks/useContract'

import { useSendOnChainCancellation } from './useSendOnChainCancellation'

import { LinguiWrapper } from '../../../../LinguiJestProvider'
import { WithMockedWeb3 } from '../../../test-utils'

const chainId = 1
const settlementCancellationTxHash = '0xcfwj23g4fwe111'
const ethFlowCancellationTxHash = '0xcfwj23g4fwe222'

jest.mock('legacy/state/orders/hooks')
jest.mock('@cowprotocol/wallet', () => {
  return {
    ...jest.requireActual('@cowprotocol/wallet'),
    useWalletInfo: jest.fn().mockReturnValue({ chainId }),
    useSendBatchTransactions: jest.fn().mockResolvedValue('0x01'),
  }
})
jest.mock('wagmi/actions', () => {
  return {
    estimateGas: jest.fn(() => Promise.resolve(1n)),
    writeContract: jest.fn(() => Promise.resolve(settlementCancellationTxHash)),
  }
})

jest.mock('common/hooks/useContract', () => {
  return {
    ...jest.requireActual('common/hooks/useContract'),
    useEthFlowContract: jest.fn(),
  }
})
jest.mock('modules/twap/hooks/useSetPartOrderCancelling', () => {
  return {
    ...jest.requireActual('modules/twap/hooks/useSetPartOrderCancelling'),
    useSetPartOrderCancelling: jest.fn().mockReturnValue(jest.fn()),
  }
})
jest.mock('modules/twap/hooks/useCancelTwapOrder', () => {
  return {
    ...jest.requireActual('modules/twap/hooks/useCancelTwapOrder'),
    useCancelTwapOrder: jest.fn(),
  }
})
jest.mock('legacy/state/enhancedTransactions/hooks')

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

const ethFlowInvalidationMock = jest.fn()

const mockWriteContract = writeContract as jest.MockedFunction<typeof writeContract>

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const WithProviders = ({ children }: PropsWithChildren) => {
  return (
    <WithMockedWeb3>
      <LinguiWrapper>{children}</LinguiWrapper>
    </WithMockedWeb3>
  )
}

// TODO: Break down this large function into smaller functions

describe('useSendOnChainCancellation() + useGetOnChainCancellation()', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ chainId })
    mockUseSetOrderCancellationHash.mockReturnValue(setOrderCancellationHash)
    mockUseRequestOrderCancellation.mockReturnValue(requestOrderCancellation)
    mockUseTransactionAdder.mockReturnValue(transactionAdder)

    ethFlowInvalidationMock.mockResolvedValue({ hash: ethFlowCancellationTxHash })

    mockUseEthFlowContract.mockReturnValue({
      result: {
        contract: {
          estimateGas: {
            invalidateOrder: () => Promise.resolve(BigNumber.from(100)),
          },
          invalidateOrder: ethFlowInvalidationMock,
          // TODO: Replace any with proper type definitions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        chainId,
        error: null,
        loading: false,
      },
    })
  })

  afterEach(() => {
    ethFlowInvalidationMock.mockClear()
  })

  it('When is ETH-flow order, then should call eth-flow contract', async () => {
    const { result } = renderHook(
      () => {
        return useSendOnChainCancellation()
      },
      { wrapper: WithProviders },
    )

    await act(async () => {
      await result.current({ ...orderMock, inputToken: NATIVE_CURRENCIES[chainId] })
    })

    expect(ethFlowInvalidationMock).toHaveBeenCalledTimes(1)
    expect(ethFlowInvalidationMock.mock.calls[0]).toMatchSnapshot()
    expect(transactionAdder.mock.calls[0][0].hash).toBe(ethFlowCancellationTxHash)
  })

  it('When is NOT ETH-flow order, then should call settlement contract', async () => {
    const { result } = renderHook(() => useSendOnChainCancellation(), { wrapper: WithProviders })

    await act(async () => {
      await result.current({ ...orderMock, inputToken: COW_TOKEN_TO_CHAIN[chainId]! })
    })

    expect(mockWriteContract).toHaveBeenCalledTimes(1)
    expect(transactionAdder.mock.calls[0][0].hash).toBe(settlementCancellationTxHash)
  })

  describe('When a transaction is sent', () => {
    it('Then should change an order status, set a tx hash to order and add the transaction to store', async () => {
      const { result } = renderHook(() => useSendOnChainCancellation(), { wrapper: WithProviders })

      await act(async () => {
        await result.current({ ...orderMock, inputToken: COW_TOKEN_TO_CHAIN[chainId]! })
      })

      expect(transactionAdder).toHaveBeenCalledTimes(1)
      expect(transactionAdder.mock.calls[0]).toMatchSnapshot()
      expect(requestOrderCancellation).toHaveBeenCalledTimes(1)
      expect(requestOrderCancellation.mock.calls[0]).toMatchSnapshot()
      expect(setOrderCancellationHash).toHaveBeenCalledTimes(1)
      expect(setOrderCancellationHash.mock.calls[0]).toMatchSnapshot()
    })
  })
})
