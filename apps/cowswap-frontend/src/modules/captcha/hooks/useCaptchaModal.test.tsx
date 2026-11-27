import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'
import { bffRateLimitedAtom } from 'entities/captcha/state/bffRateLimitedAtom'
import { captchaErrorAtom } from 'entities/captcha/state/captchaErrorAtom'
import { captchaInteractionRequiredAtom } from 'entities/captcha/state/captchaInteractionRequiredAtom'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'
import { quoteRateLimitedUntilAtom } from 'entities/captcha/state/quoteRateLimitedUntilAtom'

import { useCaptchaModal } from './useCaptchaModal'

import { captchaSlotAtom } from '../state/captchaSlot.atoms'

interface State {
  rateLimit?: 'bff' | 'quote'
  error?: boolean
  interaction?: boolean
  slot?: boolean
}

type Store = ReturnType<typeof createStore>

function createJwt(): string {
  const payload = globalThis.btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=+$/, '')

  return `header.${payload}.signature`
}

function setup(state: State): { store: Store; result: { current: ReturnType<typeof useCaptchaModal> } } {
  const store = createStore()

  if (state.rateLimit === 'bff') store.set(bffRateLimitedAtom, true)
  if (state.rateLimit === 'quote') store.set(quoteRateLimitedUntilAtom, Date.now() + 60_000)
  if (state.error) store.set(captchaErrorAtom, new Error('Challenge errored'))
  if (state.interaction) store.set(captchaInteractionRequiredAtom, true)
  if (state.slot) store.set(captchaSlotAtom, document.createElement('div'))

  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <JotaiProvider store={store}>{children}</JotaiProvider>
  }

  const { result } = renderHook(() => useCaptchaModal(), { wrapper: Wrapper })

  return { store, result }
}

describe('useCaptchaModal', () => {
  beforeEach(() => localStorage.clear())

  it.each<[string, State, boolean]>([
    ['an error without a rate limit', { error: true }, false],
    ['an error after a BFF 429', { rateLimit: 'bff', error: true }, true],
    ['an error after a quote 429, on a trade page', { rateLimit: 'quote', error: true, slot: true }, true],
    ['an interaction off trade pages', { rateLimit: 'bff', interaction: true }, true],
    ['an interaction on a trade page', { rateLimit: 'bff', interaction: true, slot: true }, false],
  ])('for %s, isModalOpen is %s', (_, state, isOpen) => {
    expect(setup(state).result.current.isModalOpen).toBe(isOpen)
  })

  it('stays open when moving Turnstile into the modal clears the interaction flag', () => {
    const { store, result } = setup({ rateLimit: 'bff', interaction: true })

    act(() => store.set(captchaInteractionRequiredAtom, false))

    expect(result.current.isModalOpen).toBe(true)
  })

  it('stays closed once dismissed', () => {
    const { store, result } = setup({ rateLimit: 'bff', interaction: true })

    act(() => result.current.dismissModal())
    act(() => store.set(captchaErrorAtom, new Error('Challenge errored')))

    expect(result.current.isModalOpen).toBe(false)
  })

  it('closes when a trade slot appears in the interaction case, and when a JWT arrives', () => {
    const interaction = setup({ rateLimit: 'bff', interaction: true })
    act(() => interaction.store.set(captchaSlotAtom, document.createElement('div')))
    expect(interaction.result.current.isModalOpen).toBe(false)

    const error = setup({ rateLimit: 'bff', error: true })
    act(() => error.store.set(captchaSlotAtom, document.createElement('div')))
    expect(error.result.current.isModalOpen).toBe(true)

    act(() => error.store.set(captchaJwtAtom, createJwt()))
    expect(error.result.current.isModalOpen).toBe(false)
  })
})
