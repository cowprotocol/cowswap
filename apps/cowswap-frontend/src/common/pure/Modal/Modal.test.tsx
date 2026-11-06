import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, waitFor } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { openModalElementsState, openModalState } from '../../state/openModalState'

import { Modal } from './index'

i18n.load('en-US', {})
i18n.activate('en-US')

function renderInStore(store: ReturnType<typeof createStore>, ui: ReactNode): ReturnType<typeof render> {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{children}</StyledComponentsThemeProvider>
      </I18nProvider>
    </Provider>
  )

  return render(ui, { wrapper })
}

function TwoModals({ isSecondOpen }: { isSecondOpen: boolean }): ReactNode {
  return (
    <>
      <Modal isOpen onDismiss={jest.fn()}>
        first
      </Modal>
      <Modal isOpen={isSecondOpen} onDismiss={jest.fn()}>
        second
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('registers its dialog element while shown and removes it once closed', async () => {
    const store = createStore()
    const { rerender } = renderInStore(
      store,
      <Modal isOpen onDismiss={jest.fn()}>
        content
      </Modal>,
    )

    const [element] = store.get(openModalElementsState)
    expect(element?.hasAttribute('data-reach-dialog-content')).toBe(true)
    expect(store.get(openModalState)).toBe(true)

    rerender(
      <Modal isOpen={false} onDismiss={jest.fn()}>
        content
      </Modal>,
    )

    await waitFor(() => expect(store.get(openModalElementsState)).toHaveLength(0))
    expect(store.get(openModalState)).toBe(false)
  })

  it('removes the element when an open modal is unmounted without being closed', () => {
    const store = createStore()
    const { unmount } = renderInStore(
      store,
      <Modal isOpen onDismiss={jest.fn()}>
        content
      </Modal>,
    )

    unmount()

    expect(store.get(openModalElementsState)).toHaveLength(0)
  })

  it('keeps the modal underneath registered when the one on top closes', async () => {
    const store = createStore()
    const { rerender } = renderInStore(store, <TwoModals isSecondOpen />)

    expect(store.get(openModalElementsState)).toHaveLength(2)

    rerender(<TwoModals isSecondOpen={false} />)

    await waitFor(() => expect(store.get(openModalElementsState)).toHaveLength(1))
    expect(store.get(openModalState)).toBe(true)
  })
})
