import { renderHook } from '@testing-library/react'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useIsWithRecipient } from './useWithRecipient'

jest.mock('./useIsWrapOrUnwrap', () => ({ useIsWrapOrUnwrap: jest.fn() }))
jest.mock('./useIsNonEvmBridging', () => ({ useIsNonEvmBridging: jest.fn() }))
jest.mock('./setupTradeState/useTradeStateFromUrl', () => ({ useTradeStateFromUrl: jest.fn() }))

const mockIsWrapOrUnwrap = useIsWrapOrUnwrap as jest.MockedFunction<typeof useIsWrapOrUnwrap>
const mockIsNonEvmBridging = useIsNonEvmBridging as jest.MockedFunction<typeof useIsNonEvmBridging>
const mockTradeStateFromUrl = useTradeStateFromUrl as jest.MockedFunction<typeof useTradeStateFromUrl>

function setup({
  isWrapOrUnwrap = false,
  isNonEvmBridging = false,
  recipientInUrl = null as string | null,
} = {}): void {
  mockIsWrapOrUnwrap.mockReturnValue(isWrapOrUnwrap)
  mockIsNonEvmBridging.mockReturnValue(isNonEvmBridging)
  mockTradeStateFromUrl.mockReturnValue(
    recipientInUrl ? ({ recipient: recipientInUrl } as ReturnType<typeof useTradeStateFromUrl>) : null,
  )
}

function render(showRecipient: boolean): boolean {
  return renderHook(() => useIsWithRecipient(showRecipient)).result.current
}

describe('useIsWithRecipient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setup()
  })

  describe('wrap/unwrap — always hidden', () => {
    it('hides when showRecipient=true', () => {
      setup({ isWrapOrUnwrap: true })
      expect(render(true)).toBe(false)
    })

    it('hides for non-EVM bridge during wrap/unwrap', () => {
      setup({ isWrapOrUnwrap: true, isNonEvmBridging: true })
      expect(render(false)).toBe(false)
    })

    it('hides even with recipient in URL', () => {
      setup({ isWrapOrUnwrap: true, recipientInUrl: '0xrecipient' })
      expect(render(false)).toBe(false)
    })
  })

  describe('non-EVM bridging — always shown, ignores toggle and wallet state', () => {
    it('shows when toggle is off', () => {
      setup({ isNonEvmBridging: true })
      expect(render(false)).toBe(true)
    })

    it('shows when toggle is on', () => {
      setup({ isNonEvmBridging: true })
      expect(render(true)).toBe(true)
    })
  })

  describe('toggle — shown when on, hidden when off (EOA, SC wallet, any EVM)', () => {
    it('shows when toggle is on', () => {
      expect(render(true)).toBe(true)
    })

    it('hides when toggle is off', () => {
      expect(render(false)).toBe(false)
    })
  })

  describe('recipient in URL — always shown regardless of toggle', () => {
    it('shows when toggle is off', () => {
      setup({ recipientInUrl: '0xrecipient' })
      expect(render(false)).toBe(true)
    })

    it('shows when toggle is on', () => {
      setup({ recipientInUrl: '0xrecipient' })
      expect(render(true)).toBe(true)
    })
  })
})
