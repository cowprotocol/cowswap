import { Percent } from '@uniswap/sdk-core'

import { act, renderHook } from '@testing-library/react'

import { useConfirmationRequest } from './useConfirmationRequest'
import { useConfirmPriceImpactWithoutFee } from './useConfirmPriceImpactWithoutFee'

// Mock useConfirmationRequest
jest.mock('./useConfirmationRequest')

const mockedUseConfirmationRequest = useConfirmationRequest as jest.MockedFunction<typeof useConfirmationRequest>

describe('useConfirmPriceImpactWithoutFee', () => {
  let mockTriggerConfirmation: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockTriggerConfirmation = jest.fn()
    mockedUseConfirmationRequest.mockReturnValue(mockTriggerConfirmation)
  })

  describe('Regular swap (isBridge = false)', () => {
    it('should return true and set isConfirmed to true when priceImpact is undefined', async () => {
      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(false))

      let confirmed: boolean = false
      await act(async () => {
        confirmed = await result.current.confirmPriceImpactWithoutFee(undefined)
      })

      expect(confirmed).toBe(true)
      expect(result.current.isConfirmed).toBe(true)
      expect(mockTriggerConfirmation).not.toHaveBeenCalled()
    })

    it('should return true and set isConfirmed to true when priceImpact is below high threshold', async () => {
      const lowPriceImpact = new Percent(3, 100) // 3% (below 5% high threshold)
      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(false))

      let confirmed: boolean = false
      await act(async () => {
        confirmed = await result.current.confirmPriceImpactWithoutFee(lowPriceImpact)
      })

      expect(confirmed).toBe(true)
      expect(result.current.isConfirmed).toBe(true)
      expect(mockTriggerConfirmation).not.toHaveBeenCalled()
    })

    it('should trigger confirmation with skipInput=false when priceImpact is well above critical threshold', async () => {
      const criticalPriceImpact = new Percent(12, 100) // 12% (well above 5% critical)
      mockTriggerConfirmation.mockResolvedValue(true)

      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(false))

      let confirmed: boolean = false
      await act(async () => {
        confirmed = await result.current.confirmPriceImpactWithoutFee(criticalPriceImpact)
      })

      expect(confirmed).toBe(true)
      expect(result.current.isConfirmed).toBe(true)
      expect(mockTriggerConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          skipInput: false,
          title: expect.any(String),
          description: expect.stringContaining('12'),
        }),
      )
    })

    it('should return false and set isConfirmed to false when user rejects confirmation', async () => {
      const highPriceImpact = new Percent(7, 100)
      mockTriggerConfirmation.mockResolvedValue(false)

      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(false))

      let confirmed: boolean = false
      await act(async () => {
        confirmed = await result.current.confirmPriceImpactWithoutFee(highPriceImpact)
      })

      expect(confirmed).toBe(false)
      expect(result.current.isConfirmed).toBe(false)
    })

    it('should return false and set isConfirmed to false when confirmation throws error', async () => {
      const highPriceImpact = new Percent(7, 100)
      mockTriggerConfirmation.mockRejectedValue(new Error('User cancelled'))

      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(false))

      let confirmed: boolean = false
      await act(async () => {
        confirmed = await result.current.confirmPriceImpactWithoutFee(highPriceImpact)
      })

      expect(confirmed).toBe(false)
      expect(result.current.isConfirmed).toBe(false)
    })

    it('should reset isConfirmed to false before showing confirmation modal', async () => {
      const highPriceImpact = new Percent(7, 100)

      // First confirm a swap
      mockTriggerConfirmation.mockResolvedValue(true)
      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(false))
      await act(async () => {
        await result.current.confirmPriceImpactWithoutFee(highPriceImpact)
      })
      expect(result.current.isConfirmed).toBe(true)

      // Then trigger another confirmation - should reset to false first
      mockTriggerConfirmation.mockImplementation(
        () =>
          new Promise((resolve) => {
            // At this point, isConfirmed should be false
            expect(result.current.isConfirmed).toBe(false)
            resolve(true)
          }),
      )

      await act(async () => {
        await result.current.confirmPriceImpactWithoutFee(highPriceImpact)
      })
    })
  })

  describe('Bridge swap (isBridge = true)', () => {
    it('should use bridge thresholds and not trigger confirmation for 3% price impact', async () => {
      const lowPriceImpact = new Percent(3, 100) // 3% (below 5% bridge critical threshold)
      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(true))

      let confirmed: boolean = false
      await act(async () => {
        confirmed = await result.current.confirmPriceImpactWithoutFee(lowPriceImpact)
      })

      expect(confirmed).toBe(true)
      expect(result.current.isConfirmed).toBe(true)
      expect(mockTriggerConfirmation).not.toHaveBeenCalled()
    })

    it('should trigger confirmation with skipInput=false when priceImpact is well above bridge critical threshold', async () => {
      const criticalPriceImpact = new Percent(17, 100) // 17% (well above 5% critical for bridge)
      mockTriggerConfirmation.mockResolvedValue(true)

      const { result } = renderHook(() => useConfirmPriceImpactWithoutFee(true))

      let confirmed: boolean = false
      await act(async () => {
        confirmed = await result.current.confirmPriceImpactWithoutFee(criticalPriceImpact)
      })

      expect(confirmed).toBe(true)
      expect(result.current.isConfirmed).toBe(true)
      expect(mockTriggerConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          skipInput: false,
        }),
      )
    })
  })
})
