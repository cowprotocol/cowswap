import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { useCountdown } from '@cowprotocol/common-hooks'

import { render } from '@testing-library/react'

import { cowBatchValidFromAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

import { DeadlineTransactionSettings } from './DeadlineTransactionSettings.container'

const VALID_FROM = 1_800_000_000
const DEADLINE = 1200

let mockDeadlineError: string | false = false

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useCountdown: jest.fn(),
}))
jest.mock('@cowprotocol/ui', () => ({
  SettingsInput: () => null,
  SettingsFeedback: ({ message }: { message: ReactNode }) => <div>{message}</div>,
}))
jest.mock('modules/trade', () => {
  const { atom } = jest.requireActual('jotai')

  return {
    cowBatchValidFromAtom: atom(undefined),
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

interface Scenario {
  isWaitAndSaveAvailable: boolean
  isWaitAndSaveEnabled: boolean
}

function renderSettings({ isWaitAndSaveAvailable, isWaitAndSaveEnabled }: Scenario): (number | null | undefined)[] {
  useIsWaitAndSaveAvailableMock.mockReturnValue(isWaitAndSaveAvailable)

  const store = createStore()
  store.set(cowBatchValidFromAtom, VALID_FROM)
  store.set(waitAndSaveEnabledAtom, isWaitAndSaveEnabled)

  render(
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <DeadlineTransactionSettings deadlineState={[DEADLINE, jest.fn()]} />
      </I18nProvider>
    </JotaiProvider>,
  )

  return useCountdownMock.mock.calls.slice(-2).map(([params]) => params.targetEpochSec)
}

describe('DeadlineTransactionSettings countdowns', () => {
  beforeEach(() => {
    useCountdownMock.mockClear()
    useIsWaitAndSaveAvailableMock.mockReset()
    mockDeadlineError = false
  })

  it('counts down the batch wait and total expiry when Wait for CoWs is shown', () => {
    const targets = renderSettings({
      isWaitAndSaveAvailable: true,
      isWaitAndSaveEnabled: true,
    })

    expect(targets).toEqual([VALID_FROM, VALID_FROM + DEADLINE])
  })

  it.each<[string, Scenario]>([
    ['Wait & Save is unavailable', { isWaitAndSaveAvailable: false, isWaitAndSaveEnabled: true }],
    ['wait-and-save is disabled', { isWaitAndSaveAvailable: true, isWaitAndSaveEnabled: false }],
  ])('does not start countdowns when %s', (_, scenario) => {
    expect(renderSettings(scenario)).toEqual([undefined, undefined])
  })

  it('does not start countdowns while the deadline error replaces the Wait for CoWs message', () => {
    mockDeadlineError = 'tooSmall'

    const targets = renderSettings({
      isWaitAndSaveAvailable: true,
      isWaitAndSaveEnabled: true,
    })

    expect(targets).toEqual([undefined, undefined])
  })
})
