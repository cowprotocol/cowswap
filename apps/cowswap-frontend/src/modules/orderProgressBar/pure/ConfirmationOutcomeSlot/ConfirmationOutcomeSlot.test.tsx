import { ReactElement } from 'react'

import { act, render, screen } from '@testing-library/react'

import { ConfirmationOutcomeSlot } from './ConfirmationOutcomeSlot.pure'

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe('ConfirmationOutcomeSlot', () => {
  const frames: FrameRequestCallback[] = []
  const requestAnimationFrame = jest.fn((callback: FrameRequestCallback): number => {
    frames.push(callback)
    return frames.length
  })

  function flushFrames(): void {
    const pending = frames.splice(0, frames.length)
    pending.forEach((callback) => {
      callback(0)
    })
  }

  beforeEach(() => {
    frames.length = 0
    requestAnimationFrame.mockClear()
    window.requestAnimationFrame = requestAnimationFrame
    window.cancelAnimationFrame = jest.fn()
    window.ResizeObserver = ResizeObserverStub
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
    }))
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 120,
      width: 100,
      top: 0,
      left: 0,
      bottom: 120,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 120,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('measures the next outcome after loading starts again', () => {
    const view = render(slotElement(false, 'First outcome'))

    expect(screen.getByTestId('confirmation-outcome').textContent).toBe('First outcome')
    act(() => {
      flushFrames()
    })
    const framesAfterFirstOutcome = requestAnimationFrame.mock.calls.length

    view.rerender(slotElement(true, 'Next outcome'))
    expect(screen.getByTestId('confirmation-outcome-loading')).toBeTruthy()

    view.rerender(slotElement(false, 'Next outcome'))

    expect(screen.getByTestId('confirmation-outcome').textContent).toBe('Next outcome')
    expect(requestAnimationFrame.mock.calls.length).toBeGreaterThan(framesAfterFirstOutcome)
  })
})

function slotElement(loading: boolean, label: string): ReactElement {
  return <ConfirmationOutcomeSlot loading={loading}>{label}</ConfirmationOutcomeSlot>
}
