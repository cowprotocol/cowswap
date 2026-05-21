/**
 * @jest-environment node
 */
import { createCowSwapWidget } from './cowSwapWidget'
import { CowSwapWidgetParams, TradeType } from './types'

describe('createCowSwapWidget (SSR)', () => {
  it('returns a no-op handler when global window is undefined', () => {
    expect(typeof window).toBe('undefined')

    const container = { innerHTML: 'should-not-be-touched' } as unknown as HTMLElement

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'test-app',
        chainId: 1,
        tradeType: TradeType.SWAP,
      },
    })

    expect(handler.iframe).toBeNull()
    expect(container.innerHTML).toBe('should-not-be-touched')
    expect(() => handler.updateParams({} as CowSwapWidgetParams)).not.toThrow()
    expect(() => handler.updateListeners()).not.toThrow()
    expect(() => handler.updateProvider()).not.toThrow()
    expect(() => handler.destroy()).not.toThrow()
  })
})
