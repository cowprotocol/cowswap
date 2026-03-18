import { finalizeEthFlowTx } from './finalizeEthFlowTx'
import { finalizeOnChainCancellation } from './finalizeOnChainCancellation'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'

jest.mock('./finalizeOnChainCancellation', () => ({
  finalizeOnChainCancellation: jest.fn(),
}))

jest.mock('../../../utils/emitOnchainTransactionEvent', () => ({
  emitOnchainTransactionEvent: jest.fn(),
}))

const finalizeOnChainCancellationMock = finalizeOnChainCancellation as jest.MockedFunction<
  typeof finalizeOnChainCancellation
>
const emitOnchainTransactionEventMock = emitOnchainTransactionEvent as jest.MockedFunction<
  typeof emitOnchainTransactionEvent
>

describe('finalizeEthFlowTx', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('delegates successful EthFlow cancellations to the shared cancellation finalizer', () => {
    const dispatch = jest.fn()

    finalizeEthFlowTx(
      {
        ethFlow: { orderId: 'order-1', subType: 'cancellation' },
      } as never,
      {
        status: 1,
      } as never,
      {
        chainId: 1,
        dispatch,
        isSafeWallet: false,
        nativeCurrencySymbol: 'ETH',
      } as never,
      '0xtx',
    )

    expect(finalizeOnChainCancellationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ethFlow: { orderId: 'order-1', subType: 'cancellation' },
      }),
      expect.objectContaining({ status: 1 }),
      expect.objectContaining({ nativeCurrencySymbol: 'ETH' }),
      '0xtx',
      'order-1',
      'ETH',
    )
    expect(dispatch).not.toHaveBeenCalled()
    expect(emitOnchainTransactionEventMock).not.toHaveBeenCalled()
  })

  it('still delegates failed EthFlow cancellations to the shared cancellation finalizer', () => {
    finalizeEthFlowTx(
      {
        ethFlow: { orderId: 'order-1', subType: 'cancellation' },
      } as never,
      {
        status: 0,
      } as never,
      {
        chainId: 1,
        dispatch: jest.fn(),
        isSafeWallet: false,
        nativeCurrencySymbol: 'ETH',
      } as never,
      '0xtx',
    )

    expect(finalizeOnChainCancellationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ethFlow: { orderId: 'order-1', subType: 'cancellation' },
      }),
      expect.objectContaining({ status: 0 }),
      expect.objectContaining({ nativeCurrencySymbol: 'ETH' }),
      '0xtx',
      'order-1',
      'ETH',
    )
  })
})
