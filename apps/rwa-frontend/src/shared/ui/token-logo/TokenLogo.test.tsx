import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { TokenLogo } from './TokenLogo'

jest.mock('@/shared/lib/theme', () => ({ useIsDarkTheme: () => false }))

const LOGO_URL = 'https://example.com/voox.png'
const TOKEN = { chainId: 42161, address: '0xFfAE0000000000000000000000000000000Aa9eF' }
const ADDRESS_KEY = '0xffae0000000000000000000000000000000aa9ef'

function getLogo(): HTMLImageElement | null {
  return document.querySelector<HTMLImageElement>('img[alt=""]')
}

function renderLogo(ui: ReactNode): void {
  render(<Provider store={createStore()}>{ui}</Provider>)
}

describe('TokenLogo', () => {
  it('falls back to the CoW token list logos, then to the first letter', () => {
    renderLogo(<TokenLogo symbol="VOOX" logoUrl={LOGO_URL} chainId={TOKEN.chainId} token={TOKEN} />)

    expect(getLogo()?.getAttribute('src')).toBe(LOGO_URL)

    fireEvent.error(getLogo() as HTMLImageElement)
    expect(getLogo()?.getAttribute('src')).toContain(`/token-lists/images/42161/${ADDRESS_KEY}/logo.png`)

    fireEvent.error(getLogo() as HTMLImageElement)
    expect(getLogo()?.getAttribute('src')).toContain(`/token-lists/images/1/${ADDRESS_KEY}/logo.png`)

    fireEvent.error(getLogo() as HTMLImageElement)
    expect(getLogo()).toBeNull()
    expect(screen.getByText('V')).toBeTruthy()
  })

  it('shows the first letter when the only logo of an asset fails to load', () => {
    renderLogo(<TokenLogo symbol="NVDA" logoUrl={LOGO_URL} />)

    fireEvent.error(getLogo() as HTMLImageElement)

    expect(getLogo()).toBeNull()
    expect(screen.getByText('N')).toBeTruthy()
  })

  it('shows the first letter without a logo', () => {
    renderLogo(<TokenLogo symbol="AAPL" logoUrl={null} />)

    expect(getLogo()).toBeNull()
    expect(screen.getByText('A')).toBeTruthy()
  })
})
