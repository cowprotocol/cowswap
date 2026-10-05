import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { CustomDeadlineDialog } from './CustomDeadlineDialog.pure'

import { calculateMinMax } from '../DeadlineSelector/utils'

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
const DAY_MS = 24 * 60 * 60 * 1000

function findLocalValueWithDifferentOffsetFromToday(): string {
  const [minDate, maxDate] = calculateMinMax()
  const todayOffset = new Date().getTimezoneOffset()

  for (let timestamp = minDate.getTime(); timestamp <= maxDate.getTime(); timestamp += DAY_MS) {
    const candidate = new Date(timestamp)
    candidate.setHours(15, 30, 0, 0)

    if (candidate < minDate || candidate > maxDate) {
      continue
    }

    if (candidate.getTimezoneOffset() !== todayOffset) {
      return toDatetimeLocalValue(candidate)
    }
  }

  throw new Error('Expected an in-range local datetime whose offset differs from today')
}

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

function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Former production helper: encodes *today's* offset, which is wrong across DST. */
function todayTimeZoneOffset(): string {
  const timezoneOffset = new Date().getTimezoneOffset()
  const offset = Math.abs(timezoneOffset)
  const offsetOperator = timezoneOffset < 0 ? '+' : '-'
  const offsetHours = Math.floor(offset / 60)
    .toString()
    .padStart(2, '0')
  const offsetMinutes = Math.floor(offset % 60)
    .toString()
    .padStart(2, '0')

  return `${offsetOperator}${offsetHours}:${offsetMinutes}`
}

describe('CustomDeadlineDialog', () => {
  const previousTz = process.env.TZ

  beforeAll(() => {
    // DST-observing zone so a selected date can disagree with today's offset.
    process.env.TZ = 'America/New_York'
  })

  afterAll(() => {
    if (previousTz === undefined) {
      delete process.env.TZ
    } else {
      process.env.TZ = previousTz
    }
  })

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

    const input = screen.getByLabelText('Set custom deadline') as HTMLInputElement
    const expectedDeadline = Math.round(new Date(input.value).getTime() / 1000)

    expect(screen.queryByText(PARSE_ERROR)).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(input.getAttribute('aria-describedby')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(selectCustomDeadline).toHaveBeenCalledTimes(1)
    expect(selectCustomDeadline).toHaveBeenCalledWith(expectedDeadline)
  })

  it("applies the selected local wall time without appending today's timezone offset", () => {
    const selectCustomDeadline = jest.fn()
    const localValue = findLocalValueWithDifferentOffsetFromToday()
    const expectedDeadline = Math.round(new Date(localValue).getTime() / 1000)
    const buggyDeadline = Math.round(new Date(localValue + todayTimeZoneOffset()).getTime() / 1000)

    expect(expectedDeadline).not.toBe(buggyDeadline)

    renderDialog(selectCustomDeadline)

    const input = screen.getByLabelText('Set custom deadline') as HTMLInputElement
    fireEvent.change(input, { target: { value: localValue } })

    expect(screen.queryByText(PARSE_ERROR)).toBeNull()
    expect((screen.getByRole('button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(false)

    const RealDate = global.Date
    const parsedDateStrings: string[] = []

    function DateSpy(...args: ConstructorParameters<typeof Date>): Date {
      if (typeof args[0] === 'string') {
        parsedDateStrings.push(args[0])
      }

      return new RealDate(...args)
    }

    DateSpy.now = RealDate.now.bind(RealDate)
    DateSpy.parse = RealDate.parse.bind(RealDate)
    DateSpy.UTC = RealDate.UTC.bind(RealDate)
    DateSpy.prototype = RealDate.prototype
    global.Date = DateSpy as unknown as DateConstructor

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    } finally {
      global.Date = RealDate
    }

    expect(parsedDateStrings.length).toBeGreaterThan(0)
    expect(parsedDateStrings.every((value) => value === localValue)).toBe(true)
    expect(selectCustomDeadline).toHaveBeenCalledWith(expectedDeadline)
    expect(selectCustomDeadline).not.toHaveBeenCalledWith(buggyDeadline)
  })
})
