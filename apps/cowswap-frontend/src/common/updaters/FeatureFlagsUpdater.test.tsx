import { Provider, createStore } from 'jotai'
import { act } from 'react'

import { syncBootFeatureFlags } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { render } from '@testing-library/react'
import { useLDClient, useLDClientError } from 'launchdarkly-react-client-sdk'

import { FeatureFlagsUpdater } from './FeatureFlagsUpdater'

import { featureFlagsAtom, featureFlagsStatusAtom } from '../state/featureFlagsState'

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  syncBootFeatureFlags: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useFeatureFlags: jest.fn(),
}))

jest.mock('launchdarkly-react-client-sdk', () => ({
  ...jest.requireActual('launchdarkly-react-client-sdk'),
  useLDClient: jest.fn(),
  useLDClientError: jest.fn(),
}))

const syncBootFeatureFlagsMock = syncBootFeatureFlags as jest.MockedFunction<typeof syncBootFeatureFlags>
const useFeatureFlagsMock = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const useLDClientMock = useLDClient as jest.MockedFunction<typeof useLDClient>
const useLDClientErrorMock = useLDClientError as jest.MockedFunction<typeof useLDClientError>

describe('FeatureFlagsUpdater', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
    syncBootFeatureFlagsMock.mockClear()
    useFeatureFlagsMock.mockReturnValue({})
    useLDClientMock.mockReturnValue(undefined)
    useLDClientErrorMock.mockReturnValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps feature flags loading until LaunchDarkly resolves', () => {
    const store = createStore()

    render(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    expect(store.get(featureFlagsStatusAtom)).toBe('loading')
  })

  it('stores flags and marks them ready after LaunchDarkly initializes', () => {
    const store = createStore()
    const flags = { isCaptchaEnabled: true }
    useFeatureFlagsMock.mockReturnValue(flags)
    useLDClientMock.mockReturnValue({} as ReturnType<typeof useLDClient>)

    render(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    expect(store.get(featureFlagsAtom)).toBe(flags)
    expect(store.get(featureFlagsStatusAtom)).toBe('ready')
  })

  it('syncs the boot-critical flags once LaunchDarkly resolves, for the next page load', () => {
    const store = createStore()
    const flags = { isSolanaEnabled: true }
    useFeatureFlagsMock.mockReturnValue(flags)
    useLDClientMock.mockReturnValue({} as ReturnType<typeof useLDClient>)

    render(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    expect(syncBootFeatureFlagsMock).toHaveBeenCalledWith(flags)
  })

  it('does not sync boot-critical flags while still waiting on LaunchDarkly', () => {
    const store = createStore()

    render(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    expect(syncBootFeatureFlagsMock).not.toHaveBeenCalled()
  })

  it('fails open when LaunchDarkly initialization times out', () => {
    const store = createStore()

    render(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    act(() => jest.advanceTimersByTime(5_000))

    expect(store.get(featureFlagsAtom)).toEqual({})
    expect(store.get(featureFlagsStatusAtom)).toBe('unavailable')
  })

  it('accepts a later successful LaunchDarkly initialization', () => {
    const store = createStore()
    const view = render(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    act(() => jest.advanceTimersByTime(5_000))

    expect(store.get(featureFlagsStatusAtom)).toBe('unavailable')

    const flags = { isCaptchaEnabled: true }
    useFeatureFlagsMock.mockReturnValue(flags)
    useLDClientMock.mockReturnValue({} as ReturnType<typeof useLDClient>)
    view.rerender(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    expect(store.get(featureFlagsAtom)).toBe(flags)
    expect(store.get(featureFlagsStatusAtom)).toBe('ready')
  })

  it('marks feature flags unavailable when LaunchDarkly fails', () => {
    const store = createStore()
    useLDClientMock.mockReturnValue({} as ReturnType<typeof useLDClient>)
    useLDClientErrorMock.mockReturnValue(new Error('LaunchDarkly failed'))

    render(
      <Provider store={store}>
        <FeatureFlagsUpdater />
      </Provider>,
    )

    expect(store.get(featureFlagsStatusAtom)).toBe('unavailable')
  })
})
