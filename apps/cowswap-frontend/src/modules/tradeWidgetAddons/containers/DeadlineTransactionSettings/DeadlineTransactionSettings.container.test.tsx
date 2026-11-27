import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { useCountdown } from '@cowprotocol/common-hooks'
import { formatApproximateBatchCountdown } from '@cowprotocol/common-utils'

import { render } from '@testing-library/react'

import { canonicalBatchScheduleAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

import { DeadlineTransactionSettings } from './DeadlineTransactionSettings.container'

const NEXT_BATCH = 1_800_000_000
const NEXT_BATCH_VALID_TO = 1_800_000_420
const DEADLINE = 1200

const SCHEDULE = {
  nextBatch: NEXT_BATCH,
  nextBatchValidTo: NEXT_BATCH_VALID_TO,
  intervalSeconds: 300,
}

let mockDeadlineError: string | false = false
let lastSettingsInputProps: { disabled?: boolean; value?: string; unit?: string } | undefined

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useCountdown: jest.fn(),
}))
jest.mock('@cowprotocol/ui', () => ({
  SettingsInput: (props: { disabled?: boolean; value?: string; unit?: string }) => {
    lastSettingsInputProps = props
    return null
  },
  SettingsFeedback: ({ message }: { message: ReactNode }) => <div>{message}</div>,
}))
jest.mock('modules/trade', () => {
  const { atom } = jest.requireActual('jotai')

  return {
    canonicalBatchScheduleAtom: atom<
      { nextBatch: number; nextBatchValidTo: number; intervalSeconds: number } | undefined
    >(undefined),
    waitAndSaveEnabledAtom: atom(false),
    useIsWaitAndSaveAvailable: jest.fn(),
  }
})
jest.mock('lib/hooks/useNativeCurrency', () => ({ __esModule: true, default: () => ({ symbol: 'ETH' }) }))
jest.mock('./hooks/useCustomDeadline', () => ({
  useCustomDeadline: () => ({
    viewValue: '20',
    parseCustomDeadline: jest.fn(),
    error: mockDeadlineError,
    isDisabled: false,
    onBlur: jest.fn(),
    deadlineRangeParams: { minMinutes: 5, maxMinutes: 180 },
  }),
}))

const useCountdownMock = jest.mocked(useCountdown)
const useIsWaitAndSaveAvailableMock = jest.mocked(useIsWaitAndSaveAvailable)

interface RenderedDeadlineSettings {
  targetEpochSec: number | null | undefined
  disabled: boolean | undefined
  value: string | undefined
  unit: string | undefined
}

interface Scenario {
  isWaitAndSaveAvailable: boolean
  isWaitAndSaveEnabled: boolean
}

function renderSettings(
  { isWaitAndSaveAvailable, isWaitAndSaveEnabled }: Scenario,
  schedule: typeof SCHEDULE | null = SCHEDULE,
  setDeadline: (deadline: number) => void = jest.fn(),
): RenderedDeadlineSettings {
  useIsWaitAndSaveAvailableMock.mockReturnValue(isWaitAndSaveAvailable)

  const store = createStore()
  store.set(canonicalBatchScheduleAtom, schedule ?? undefined)
  store.set(waitAndSaveEnabledAtom, isWaitAndSaveEnabled)

  render(
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <DeadlineTransactionSettings deadlineState={[DEADLINE, setDeadline]} />
      </I18nProvider>
    </JotaiProvider>,
  )

  return {
    targetEpochSec: useCountdownMock.mock.calls.at(-1)?.[0].targetEpochSec,
    disabled: lastSettingsInputProps?.disabled,
    value: lastSettingsInputProps?.value,
    unit: lastSettingsInputProps?.unit,
  }
}

describe('DeadlineTransactionSettings countdowns', () => {
  beforeEach(() => {
    useCountdownMock.mockClear()
    useIsWaitAndSaveAvailableMock.mockReset()
    mockDeadlineError = false
    lastSettingsInputProps = undefined
    jest.restoreAllMocks()
  })

  it('counts down to nextBatchValidTo and shows that expiry without changing the saved deadline', () => {
    const setDeadline = jest.fn()
    jest.spyOn(Date, 'now').mockReturnValue((NEXT_BATCH_VALID_TO - 420) * 1000)

    const settings = renderSettings(
      {
        isWaitAndSaveAvailable: true,
        isWaitAndSaveEnabled: true,
      },
      SCHEDULE,
      setDeadline,
    )

    expect(settings.targetEpochSec).toBe(NEXT_BATCH_VALID_TO)
    expect(settings.disabled).toBe(true)
    expect(settings.value).toBe('~7 min')
    expect(settings.unit).toBeUndefined()
    expect(setDeadline).not.toHaveBeenCalled()
    expect(useCountdownMock.mock.calls.at(-1)?.[0].format).toBe(formatApproximateBatchCountdown)
  })

  it('disables swap expiration when the toggle is on even if the batch expiry is still loading', () => {
    const settings = renderSettings(
      {
        isWaitAndSaveAvailable: true,
        isWaitAndSaveEnabled: true,
      },
      null,
    )

    expect(settings.targetEpochSec).toBeUndefined()
    expect(settings.disabled).toBe(true)
    expect(settings.value).toBe('20')
    expect(settings.unit).toBe('minutes')
  })

  it.each<[string, Scenario]>([
    ['Wait & Save is unavailable', { isWaitAndSaveAvailable: false, isWaitAndSaveEnabled: true }],
    ['wait-and-save is disabled', { isWaitAndSaveAvailable: true, isWaitAndSaveEnabled: false }],
  ])('does not start a countdown and leaves swap expiration editable when %s', (_, scenario) => {
    expect(renderSettings(scenario)).toEqual({
      targetEpochSec: undefined,
      disabled: false,
      value: '20',
      unit: 'minutes',
    })
  })

  it('does not start a countdown while the deadline error replaces the Wait for CoWs message', () => {
    mockDeadlineError = 'tooSmall'

    const settings = renderSettings({
      isWaitAndSaveAvailable: true,
      isWaitAndSaveEnabled: true,
    })

    expect(settings.targetEpochSec).toBeUndefined()
    expect(settings.disabled).toBe(true)
  })
})
