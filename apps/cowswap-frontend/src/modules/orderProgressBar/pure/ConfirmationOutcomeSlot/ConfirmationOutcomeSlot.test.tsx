import { ReactElement, ReactNode } from 'react'

import { act, render, screen } from '@testing-library/react'

import { ConfirmationOutcomeSlot } from './ConfirmationOutcomeSlot.pure'

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe('ConfirmationOutcomeSlot', () => {
  const measured = { panelHeight: 120, scrollHeight: 120 }
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
    measured.panelHeight = 120
    measured.scrollHeight = 120
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
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      height: measured.panelHeight,
      width: 100,
      top: 0,
      left: 0,
      bottom: measured.panelHeight,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }))
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => measured.scrollHeight,
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

  it('drops the placeholder when an empty outcome stays empty after the first measurement', () => {
    measured.panelHeight = 230
    measured.scrollHeight = 0
    render(slotElement(false, null))

    act(() => {
      flushFrames()
    })
    expect(reservesPlaceholder()).toBe(true)

    act(() => {
      flushFrames()
    })

    expect(reservesPlaceholder()).toBe(false)
    expect(screen.getByTestId('confirmation-outcome').textContent).toBe('')
  })

  it('animates a non-empty outcome that has no height on the first frame', () => {
    measured.panelHeight = 230
    measured.scrollHeight = 0
    render(slotElement(false, 'Later outcome'))
    const panel = screen.getByTestId('confirmation-outcome')

    act(() => {
      flushFrames()
    })
    expect(panel.style.height).toBe('')
    expect(reservesPlaceholder()).toBe(true)

    measured.scrollHeight = 80
    act(() => {
      flushFrames()
    })

    expect(panel.style.height).toBe('80px')
    expect(reservesPlaceholder()).toBe(true)
  })
})

function reservesPlaceholder(): boolean {
  const frame = screen.getByTestId('confirmation-outcome').parentElement
  return frame?.style.getPropertyValue('--progress-top-section-height') !== ''
}

function slotElement(loading: boolean, label: ReactNode): ReactElement {
  return <ConfirmationOutcomeSlot loading={loading}>{label}</ConfirmationOutcomeSlot>
}
