import { act, fireEvent, render, screen } from '@testing-library/react'

import { OrderProgressBarPlaygroundPage } from './OrderProgressBarPlayground.page'

jest.mock('modules/orderProgressBar', () => {
  const actual = jest.requireActual('modules/orderProgressBar')

  return {
    ...actual,
    OrderProgressBar: ({
      countdown,
      disableAnalytics,
      stepName,
    }: {
      countdown?: number | null
      disableAnalytics?: boolean
      stepName?: string
    }) => (
      <div data-analytics={disableAnalytics ? 'off' : 'on'} data-testid="progress-bar-state">
        {stepName}:{countdown ?? 'none'}
      </div>
    ),
  }
})

describe('OrderProgressBarPlaygroundPage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('replays the submission retry scenario from the dropdown', () => {
    render(<OrderProgressBarPlaygroundPage />)

    expect(screen.getByTestId('progress-bar-state').getAttribute('data-analytics')).toBe('off')

    act(() => {
      fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: 'submissionRetry' } })
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('initial:none')

    act(() => {
      jest.advanceTimersByTime(1200)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('initial:none')

    act(() => {
      jest.advanceTimersByTime(3800)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('solving:15')

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('executing:none')

    act(() => {
      jest.advanceTimersByTime(1200)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('submissionFailed:none')

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('solving:none')

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('executing:none')

    act(() => {
      jest.advanceTimersByTime(1200)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('finished:none')
  })

  it('counts down during the solving frame instead of staying pinned at 15', () => {
    render(<OrderProgressBarPlaygroundPage />)

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('solving:15')

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('solving:13')
  })

  it('resets safely when switching from a longer scenario to a shorter one', () => {
    render(<OrderProgressBarPlaygroundPage />)

    act(() => {
      fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: 'submissionRetryWithNotFound' } })
      jest.advanceTimersByTime(5700)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('solving:15')

    act(() => {
      fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: 'fastFillFromInitial' } })
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('initial:none')
  })

  it('restarts the current scenario from the first frame when replaying', () => {
    render(<OrderProgressBarPlaygroundPage />)

    act(() => {
      fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: 'reloadMissedFulfilledEvent' } })
      jest.advanceTimersByTime(6500)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('executing:none')

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Replay scenario' }))
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('initial:none')
  })

  it('replays the issue 6642 unfillable-start scenario', () => {
    render(<OrderProgressBarPlaygroundPage />)

    act(() => {
      fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: 'issue6642StartsUnfillable' } })
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('initial:none')

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('solving:15')

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('delayed:none')

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('executing:none')

    act(() => {
      jest.advanceTimersByTime(1200)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('finished:none')
  })

  it('replays the issue 6881 unfillable-to-cancelling scenario', () => {
    render(<OrderProgressBarPlaygroundPage />)

    act(() => {
      fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: 'issue6881UnfillableToCancelling' } })
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('solving:15')

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('unfillable:none')

    act(() => {
      jest.advanceTimersByTime(1200)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('cancelling:none')

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('cancelled:none')
  })

  it('pins a single static step without progressing when static mode is enabled', () => {
    render(<OrderProgressBarPlaygroundPage />)

    act(() => {
      fireEvent.change(screen.getByLabelText('Mode'), { target: { value: 'static' } })
      fireEvent.change(screen.getByLabelText('Static step'), { target: { value: 'executing' } })
      jest.advanceTimersByTime(20000)
    })

    expect(screen.getByTestId('progress-bar-state').textContent).toBe('executing:none')
  })
})
