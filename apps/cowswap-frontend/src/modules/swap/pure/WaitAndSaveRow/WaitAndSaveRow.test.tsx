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

function expectExactText(text: string): void {
  expect(
    screen.getByText((_, element) => {
      if (!element || normalizeText(element.textContent) !== text) {
        return false
      }

      return Array.from(element.children).every((child) => normalizeText(child.textContent) !== text)
    }),
  ).toBeTruthy()
}

function normalizeText(value: string | null | undefined): string {
  // ThreeDots inserts word joiners between the dots.
  return (value ?? '')
    .replace(/\u2060/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function renderRow(props: Partial<WaitAndSaveRowProps> = {}): void {
  render(
    <I18nProvider i18n={i18n}>
      <WaitAndSaveRow
        isEnabled={false}
        toggle={jest.fn()}
        joinsBatchInRef={createRef()}
        hasError={false}
        isLoading={false}
        isFetching={false}
        onRetry={jest.fn()}
        {...props}
      />
    </I18nProvider>,
  )
}

describe('WaitAndSaveRow', () => {
  it('shows a batch-time skeleton while the schedule is loading', () => {
    renderRow({ isLoading: true })

    expectExactText('Joins batch in ~')
    expect(screen.getByTestId('batch-time-skeleton')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Wait & save' })).toBeTruthy()
  })

  it('replaces the toggle with a retry action when the schedule failed', () => {
    const onRetry = jest.fn()

    renderRow({ hasError: true, onRetry, saveAmount: '$2.50' })

    expectExactText('Wait & save')
    expect(screen.queryByText('$2.50')).toBeNull()
    expectExactText('Couldn’t load the next batch time · Try again')
    expect(screen.queryByRole('checkbox', { name: 'Wait & save' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('replaces Try again with Fetching batch time while a retry is in flight', () => {
    renderRow({ hasError: true, isFetching: true })

    expectExactText('Couldn’t load the next batch time · Fetching batch time...')
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.queryByRole('checkbox', { name: 'Wait & save' })).toBeNull()
  })

  it('shows the save amount on the title and approximate joins-batch copy when provided', () => {
    renderRow({ saveAmount: '$2.50' })

    expectExactText('Wait & save $2.50')
    expectExactText('No volume fee · Joins batch in ~')
  })

  it('uses a live joins-batch prefix when enabled', () => {
    renderRow({ isEnabled: true, saveAmount: '$2.50' })

    expectExactText('No volume fee · Joins batch in')
  })

  it('falls back to approximate joins-batch copy when no amount is provided', () => {
    renderRow()

    expectExactText('Wait & save')
    expectExactText('Joins batch in ~')
  })
})
