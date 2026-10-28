import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { openModalState } from '../../state/openModalState'

import { Modal } from './index'

i18n.load('en-US', {})
i18n.activate('en-US')

function renderModal(isOpen: boolean, store: ReturnType<typeof createStore>): ReturnType<typeof render> {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{children}</StyledComponentsThemeProvider>
      </I18nProvider>
    </Provider>
  )

  return render(
    <Modal isOpen={isOpen} onDismiss={jest.fn()}>
      content
    </Modal>,
    { wrapper },
  )
}

describe('Modal', () => {
  it('marks a modal as open while it is shown and clears it once closed', () => {
    const store = createStore()
    const { rerender } = renderModal(true, store)

    expect(store.get(openModalState)).toBe(true)

    rerender(
      <Modal isOpen={false} onDismiss={jest.fn()}>
        content
      </Modal>,
    )

    expect(store.get(openModalState)).toBe(false)
  })

  it('clears the open-modal flag when an open modal is unmounted without being closed', () => {
    const store = createStore()
    const { unmount } = renderModal(true, store)

    unmount()

    expect(store.get(openModalState)).toBe(false)
  })
})
