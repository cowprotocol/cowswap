import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { jotaiStore } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import {
  resetEoaTwapSuccessScreenIfMatches,
  useEoaTwapFlowUpdater,
  useEoaTwapSigningStep,
} from './useEoaTwapSigningStep'

import { EoaTwapSigningPhase, EoaTwapSigningSteps, eoaTwapSigningStepAtom } from '../state/eoaTwapSigningStepAtom'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

const DEFAULT_PLAN = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

function createWrapper(store: ReturnType<typeof createStore>): ({ children }: { children: ReactNode }) => ReactNode {
  return function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }
}

const EVENT_ID = '1'.repeat(70)

describe('useEoaTwapFlowUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: 1, account: '0xabc' } as ReturnType<typeof useWalletInfo>)
  })

  it('clears EOA TWAP signing state when chainId changes', () => {
    const store = createStore()
    store.set(eoaTwapSigningStepAtom, {
      step: EoaTwapSigningSteps.Success,
      phase: EoaTwapSigningPhase.Confirmed,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    })

    const { rerender } = renderHook(
      () => {
        useEoaTwapFlowUpdater()
        return useEoaTwapSigningStep()
      },
      { wrapper: createWrapper(store) },
    )

    mockUseWalletInfo.mockReturnValue({ chainId: 42161, account: '0xabc' } as ReturnType<typeof useWalletInfo>)

    act(() => {
      rerender()
    })

    expect(store.get(eoaTwapSigningStepAtom)).toBeNull()
  })

  it('clears EOA TWAP signing state when account changes', () => {
    const store = createStore()
    store.set(eoaTwapSigningStepAtom, {
      step: EoaTwapSigningSteps.Success,
      phase: EoaTwapSigningPhase.Confirmed,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    })

    const { rerender } = renderHook(
      () => {
        useEoaTwapFlowUpdater()
        return useEoaTwapSigningStep()
      },
      { wrapper: createWrapper(store) },
    )

    mockUseWalletInfo.mockReturnValue({ chainId: 1, account: '0xdef' } as ReturnType<typeof useWalletInfo>)

    act(() => {
      rerender()
    })

    expect(store.get(eoaTwapSigningStepAtom)).toBeNull()
  })

  it('does not clear signing state on initial render', () => {
    const store = createStore()
    const signingState = {
      step: EoaTwapSigningSteps.Success,
      phase: EoaTwapSigningPhase.Confirmed,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    }
    store.set(eoaTwapSigningStepAtom, signingState)

    renderHook(
      () => {
        useEoaTwapFlowUpdater()
        return useEoaTwapSigningStep()
      },
      { wrapper: createWrapper(store) },
    )

    expect(store.get(eoaTwapSigningStepAtom)).toEqual(signingState)
  })
})

describe('resetEoaTwapSuccessScreenIfMatches', () => {
  beforeEach(() => {
    jotaiStore.set(eoaTwapSigningStepAtom, null)
  })

  it('clears the success screen when the cancelled TWAP order matches the active success state', () => {
    const updateEoaTwapFlow = jest.fn()

    jotaiStore.set(eoaTwapSigningStepAtom, {
      step: EoaTwapSigningSteps.Success,
      phase: EoaTwapSigningPhase.Confirmed,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
      eventId: EVENT_ID,
    })

    resetEoaTwapSuccessScreenIfMatches(EVENT_ID, updateEoaTwapFlow)

    expect(updateEoaTwapFlow).toHaveBeenCalledWith(null)
  })

  it('does not clear the success screen for a different TWAP order', () => {
    const updateEoaTwapFlow = jest.fn()

    jotaiStore.set(eoaTwapSigningStepAtom, {
      step: EoaTwapSigningSteps.Success,
      phase: EoaTwapSigningPhase.Confirmed,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
      eventId: EVENT_ID,
    })

    resetEoaTwapSuccessScreenIfMatches('0xother', updateEoaTwapFlow)

    expect(updateEoaTwapFlow).not.toHaveBeenCalled()
  })
})
