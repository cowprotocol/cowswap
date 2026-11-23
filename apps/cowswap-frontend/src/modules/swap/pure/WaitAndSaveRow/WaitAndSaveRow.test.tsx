import { createRef } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'

import { WaitAndSaveRow, WaitAndSaveRowProps } from './WaitAndSaveRow.pure'

jest.mock('@cowprotocol/ui', () => ({
  ...jest.requireActual('@cowprotocol/ui'),
  TooltipIcon: () => null,
  Toggle: ({ checked, 'aria-label': ariaLabel }: { checked: boolean; 'aria-label'?: string }) => (
    <input type="checkbox" checked={checked} aria-label={ariaLabel} readOnly />
  ),
}))
jest.mock('react-inlinesvg', () => () => null)

function renderRow(props: Partial<WaitAndSaveRowProps> = {}): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <WaitAndSaveRow
        isEnabled={false}
        toggle={jest.fn()}
        joinsBatchInRef={createRef()}
        isScheduleError={false}
        isScheduleLoading={false}
        isScheduleFetching={false}
        onRetry={jest.fn()}
        {...props}
      />
    </I18nProvider>,
  )
}

describe('WaitAndSaveRow', () => {
  it('shows a batch-time skeleton while the schedule is loading', () => {
    renderRow({ isScheduleLoading: true })

    expect(screen.getByText(/Joins batch in/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Wait & save' })).toBeTruthy()
  })

  it('replaces the toggle with a retry action when the schedule failed', () => {
    const onRetry = jest.fn()

    renderRow({ isScheduleError: true, onRetry })

    expect(screen.getByText('Couldn’t load the next batch time')).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: 'Wait & save' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('replaces Try again with Fetching batch time while a retry is in flight', () => {
    renderRow({ isScheduleError: true, isScheduleFetching: true })

    expect(screen.getByText('Couldn’t load the next batch time')).toBeTruthy()
    expect(screen.getByText(/Fetching batch time/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.queryByRole('checkbox', { name: 'Wait & save' })).toBeNull()
  })
})
