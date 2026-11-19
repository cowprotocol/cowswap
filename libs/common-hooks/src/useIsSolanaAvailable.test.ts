import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { useIsSolanaAvailable, useSetIsSolanaEnabledInWidget } from './useIsSolanaAvailable'

function renderSolanaAvailability(): ReturnType<
  typeof renderHook<{ isAvailable: boolean; setEnabledInWidget: (value: boolean) => void }, unknown>
> {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

  return renderHook(
    () => ({ isAvailable: useIsSolanaAvailable(), setEnabledInWidget: useSetIsSolanaEnabledInWidget() }),
    { wrapper },
  )
}

describe('useIsSolanaAvailable', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('is true outside the widget', () => {
    expect(renderSolanaAvailability().result.current.isAvailable).toBe(true)
  })

  it('is false inside the widget until a partner opts in', () => {
    window.location.hash = '#/1/widget/swap'

    expect(renderSolanaAvailability().result.current.isAvailable).toBe(false)
  })

  it('follows the opt-in inside the widget', () => {
    window.location.hash = '#/1/widget/swap'

    const { result } = renderSolanaAvailability()

    act(() => result.current.setEnabledInWidget(true))

    expect(result.current.isAvailable).toBe(true)
  })

  it('ignores the opt-in outside the widget', () => {
    const { result } = renderSolanaAvailability()

    act(() => result.current.setEnabledInWidget(false))

    expect(result.current.isAvailable).toBe(true)
  })
})
