import { renderHook } from '@testing-library/react'

import { useIsNonEvmBridging } from 'modules/trade'

import { useIsRecipientRequired } from './useIsRecipientRequired'

jest.mock('modules/trade', () => ({
  useIsNonEvmBridging: jest.fn(),
}))

const mockUseIsNonEvmBridging = useIsNonEvmBridging as jest.MockedFunction<typeof useIsNonEvmBridging>

function renderIsRecipientRequired(): boolean {
  return renderHook(() => useIsRecipientRequired()).result.current
}

describe('useIsRecipientRequired', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns true for non-EVM bridging', () => {
    mockUseIsNonEvmBridging.mockReturnValue(true)
    expect(renderIsRecipientRequired()).toBe(true)
  })

  it('returns false for EVM bridging (SC wallet or EOA)', () => {
    mockUseIsNonEvmBridging.mockReturnValue(false)
    expect(renderIsRecipientRequired()).toBe(false)
  })

  it('returns false when not bridging', () => {
    mockUseIsNonEvmBridging.mockReturnValue(false)
    expect(renderIsRecipientRequired()).toBe(false)
  })
})
