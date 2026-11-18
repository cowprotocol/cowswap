import { createRef } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'

import { WaitAndSaveRow } from './WaitAndSaveRow.pure'

jest.mock('@cowprotocol/ui', () => ({
  ...jest.requireActual('@cowprotocol/ui'),
  TooltipIcon: () => null,
  Toggle: ({ checked, 'aria-label': ariaLabel }: { checked: boolean; 'aria-label'?: string }) => (
    <input type="checkbox" checked={checked} aria-label={ariaLabel} readOnly />
  ),
}))
jest.mock('react-inlinesvg', () => () => null)

describe('WaitAndSaveRow', () => {
  it('replaces the toggle with a retry action when the schedule failed', () => {
    const onRetry = jest.fn()

    render(
      <I18nProvider i18n={i18n}>
        <WaitAndSaveRow isEnabled={false} toggle={jest.fn()} joinsBatchInRef={createRef()} hasError onRetry={onRetry} />
      </I18nProvider>,
    )

    expect(
      screen.getByText((_, element) => {
        const text = 'Couldn’t load the next batch time · Try again'
        if (!element || element.textContent !== text) {
          return false
        }

        return Array.from(element.children).every((child) => child.textContent !== text)
      }),
    ).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: 'Wait & save' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
