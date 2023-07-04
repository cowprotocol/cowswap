import { renderHook } from '@testing-library/react-hooks'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useSwapActionHandlers } from 'legacy/state/swap/hooks'

import { useSafeBundleApprovalFlowContext } from 'modules/swap/hooks/useSafeBundleApprovalFlowContext'
import { ethFlow } from 'modules/swap/services/ethFlow'
import { safeBundleApprovalFlow, safeBundleEthFlow } from 'modules/swap/services/safeBundleFlow'
import { swapFlow } from 'modules/swap/services/swapFlow'

import { withModalProvider } from 'utils/withModalProvider'

import { useEthFlowContext } from './useEthFlowContext'
import { useHandleSwap } from './useHandleSwap'
import { useSafeBundleEthFlowContext } from './useSafeBundleEthFlowContext'
import { useSwapFlowContext } from './useSwapFlowContext'

jest.mock('./useSwapFlowContext')
jest.mock('./useEthFlowContext')
jest.mock('./useSafeBundleApprovalFlowContext')
jest.mock('./useSafeBundleEthFlowContext')
jest.mock('legacy/state/swap/hooks')
jest.mock('modules/swap/services/swapFlow')
jest.mock('modules/swap/services/ethFlow')
jest.mock('modules/swap/services/safeBundleFlow')

const mockUseSwapActionHandlers = useSwapActionHandlers as jest.MockedFunction<typeof useSwapActionHandlers>
const mockSwapFlow = swapFlow as jest.MockedFunction<typeof swapFlow>
const mockEthFlow = ethFlow as jest.MockedFunction<typeof ethFlow>
const mockSafeBundleApprovalFlow = safeBundleApprovalFlow as jest.MockedFunction<typeof safeBundleApprovalFlow>
const mockSafeBundleEthFlow = safeBundleEthFlow as jest.MockedFunction<typeof safeBundleEthFlow>
const mockUseSwapFlowContext = useSwapFlowContext as jest.MockedFunction<typeof useSwapFlowContext>
const mockUseEthFlowContext = useEthFlowContext as jest.MockedFunction<typeof useEthFlowContext>
const mockUseSafeBundleFlowContext = useSafeBundleApprovalFlowContext as jest.MockedFunction<
  typeof useSafeBundleApprovalFlowContext
>
const mockUseSafeBundleEthFlowContext = useSafeBundleEthFlowContext as jest.MockedFunction<
  typeof useSafeBundleEthFlowContext
>

const priceImpactMock: PriceImpact = {
  priceImpact: undefined,
  error: undefined,
  loading: false,
}
describe('useHandleSwapCallback', () => {
  let onChangeRecipient: jest.Mock

  beforeEach(() => {
    onChangeRecipient = jest.fn()

    mockUseSwapActionHandlers.mockReturnValue({ onChangeRecipient } as any)
    mockUseSwapFlowContext.mockReturnValue(1 as any)
    mockUseEthFlowContext.mockReturnValue(1 as any)
    mockUseSafeBundleFlowContext.mockReturnValue(1 as any)
    mockUseSafeBundleEthFlowContext.mockReturnValue(1 as any)

    mockSwapFlow.mockImplementation(() => Promise.resolve())
    mockEthFlow.mockImplementation(() => Promise.resolve())
    mockSafeBundleApprovalFlow.mockImplementation(() => Promise.resolve())
    mockSafeBundleEthFlow.mockImplementation(() => Promise.resolve())
  })

  it('When a swap happened, then the recipient value should be deleted', async () => {
    const { result } = renderHook(() => useHandleSwap(priceImpactMock), { wrapper: withModalProvider })

    await result.current()

    expect(onChangeRecipient).toBeCalledTimes(1)
    expect(onChangeRecipient).toHaveBeenCalledWith(null)
  })
})
