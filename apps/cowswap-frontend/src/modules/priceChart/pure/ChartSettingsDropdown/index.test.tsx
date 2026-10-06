/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createStore, Provider } from 'jotai'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { priceChartSupplyBasisAtom } from '../../state/priceChartSupplyBasisAtom'

import { ChartSettingsDropdown } from '.'

jest.mock('react-inlinesvg', () => () => null)

i18n.load('en-US', {})
i18n.activate('en-US')

beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
})

it('updates the shared supply preference and restores focus after closing the menu', async () => {
  const user = userEvent.setup()
  const store = createStore()
  store.set(priceChartSupplyBasisAtom, 'circulating')
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <ChartSettingsDropdown />
      </Provider>
    </I18nProvider>,
  )
  const button = screen.getByRole('button', { name: 'Chart settings' })
  await user.click(button)
  const option = await screen.findByRole('checkbox', { name: 'Total supply for Market Cap' })
  expect((option as HTMLInputElement).checked).toBe(false)
  expect((screen.getByRole('checkbox', { name: 'Maximize price chart' }) as HTMLInputElement).disabled).toBe(true)
  await user.click(screen.getByText('Total supply for Market Cap'))
  expect(store.get(priceChartSupplyBasisAtom)).toBe('total')
  expect((option as HTMLInputElement).checked).toBe(true)
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('checkbox')).toBeNull()
  expect(document.activeElement).toBe(button)
  button.focus()
  await user.keyboard('{ArrowDown}')
  expect(
    ((await screen.findByRole('checkbox', { name: 'Total supply for Market Cap' })) as HTMLInputElement).checked,
  ).toBe(true)
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('menu')))
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('checkbox')).toBeNull()
})

it('toggles chart size inside settings and reflects the expanded state', async () => {
  const user = userEvent.setup()
  const onToggle = jest.fn()
  const renderSettings = (isExpanded: boolean) => (
    <I18nProvider i18n={i18n}>
      <ChartSettingsDropdown sizeControl={{ isExpanded, onToggle }} />
    </I18nProvider>
  )
  const { rerender } = render(renderSettings(false))
  await user.click(screen.getByRole('button', { name: 'Chart settings' }))
  expect(((await screen.findByRole('checkbox', { name: 'Maximize price chart' })) as HTMLInputElement).checked).toBe(
    false,
  )
  await user.click(screen.getByText('Maximize price chart'))
  expect(onToggle).toHaveBeenCalledTimes(1)
  rerender(renderSettings(true))
  expect((screen.getByRole('checkbox', { name: 'Maximize price chart' }) as HTMLInputElement).checked).toBe(true)
})
