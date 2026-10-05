import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { CustomDeadlineDialog } from './CustomDeadlineDialog.pure'

jest.mock('@cowprotocol/ui', () => {
  const actual = jest.requireActual<typeof import('@cowprotocol/ui')>('@cowprotocol/ui')

  return {
    ...actual,
    ConfirmBottomDrawerOrDialog: ({
      content,
      onConfirm,
      confirmDisabled,
      confirmLabel,
    }: {
      content: ReactNode
      onConfirm(): void
      confirmDisabled?: boolean
      confirmLabel: ReactNode
    }) => (
      <div>
        {content}
        <button type="button" disabled={confirmDisabled} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    ),
  }
})

const PARSE_ERROR = 'Failed to parse date and time provided'

function renderDialog(selectCustomDeadline: (deadline: number) => void = jest.fn()): void {
  render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <CustomDeadlineDialog
          isOpen
          customDeadline={null}
          onDismiss={jest.fn()}
          selectCustomDeadline={selectCustomDeadline}
        />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('CustomDeadlineDialog', () => {
  it('keeps a parse error for unparseable input and does not apply it', () => {
    const selectCustomDeadline = jest.fn()
    renderDialog(selectCustomDeadline)

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const input = screen.getByLabelText('Set custom deadline') as HTMLInputElement
    // datetime-local rejects non-dates. The text fallback is what can submit an unparseable value.
    input.type = 'text'
    fireEvent.change(input, { target: { value: 'not-a-date' } })

    const applyButton = screen.getByRole('button', { name: 'Apply' })
    const error = screen.getByText(PARSE_ERROR)

    expect(error).toBeTruthy()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe(error.id)
    expect((applyButton as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(applyButton)
    expect(selectCustomDeadline).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('applies a deadline that parses inside the allowed range', () => {
    const selectCustomDeadline = jest.fn()
    renderDialog(selectCustomDeadline)

    const input = screen.getByLabelText('Set custom deadline')

    expect(screen.queryByText(PARSE_ERROR)).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(input.getAttribute('aria-describedby')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(selectCustomDeadline).toHaveBeenCalledTimes(1)
    expect(Number.isFinite(selectCustomDeadline.mock.calls[0][0])).toBe(true)
  })
})
