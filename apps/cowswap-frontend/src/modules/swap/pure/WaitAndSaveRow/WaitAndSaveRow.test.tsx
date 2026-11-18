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
      if (!element || element.textContent !== text) {
        return false
      }

      return Array.from(element.children).every((child) => child.textContent !== text)
    }),
  ).toBeTruthy()
}

function renderRow(props: Partial<WaitAndSaveRowProps> = {}): void {
  render(
    <I18nProvider i18n={i18n}>
      <WaitAndSaveRow
        isEnabled={false}
        toggle={jest.fn()}
        joinsBatchInRef={createRef()}
        hasError={false}
        onRetry={jest.fn()}
        {...props}
      />
    </I18nProvider>,
  )
}

describe('WaitAndSaveRow', () => {
  it('replaces the toggle with a retry action when the schedule failed', () => {
    const onRetry = jest.fn()

    renderRow({ hasError: true, onRetry })

    expectExactText('Couldn’t load the next batch time · Try again')
    expect(screen.queryByRole('checkbox', { name: 'Wait & save' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows the save amount when provided', () => {
    renderRow({ saveAmount: '$2.50' })

    expectExactText('Save at least $2.50 · Join batch in ')
  })

  it('falls back to generic save copy when no amount is provided', () => {
    renderRow()

    expectExactText('Save more by joining a batch in ')
  })
})
