import { createStore, Provider } from 'jotai'

import { render, screen } from '@testing-library/react'

import { WalletBar, WalletBarSlot } from './WalletBar'

jest.mock('@/features/connect-wallet', () => ({
  ConnectButton: () => <button type="button">Connect wallet</button>,
}))

describe('WalletBarSlot', () => {
  it('renders its content in the wallet bar, next to the wallet', () => {
    render(
      <Provider store={createStore()}>
        <WalletBar />
        <WalletBarSlot>
          <button type="button">Buy NVDA</button>
        </WalletBarSlot>
      </Provider>,
    )

    const slot = screen.getByRole('button', { name: 'Buy NVDA' }).parentElement

    expect(slot?.previousElementSibling).toBe(screen.getByRole('button', { name: 'Connect wallet' }))
  })

  it('renders nothing without a wallet bar', () => {
    render(
      <Provider store={createStore()}>
        <WalletBarSlot>
          <button type="button">Buy NVDA</button>
        </WalletBarSlot>
      </Provider>,
    )

    expect(screen.queryByRole('button', { name: 'Buy NVDA' })).toBeNull()
  })
})
