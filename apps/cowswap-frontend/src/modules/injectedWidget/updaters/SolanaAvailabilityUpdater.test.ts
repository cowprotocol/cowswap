import { createElement, Fragment, ReactNode } from 'react'

import { useIsSolanaAvailable } from '@cowprotocol/common-hooks'
import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { render, screen } from '@testing-library/react'

import { SolanaAvailabilityUpdater } from './SolanaAvailabilityUpdater'

let mockIsSolanaWalletEnabled = true
let mockWidgetParams: Partial<CowSwapWidgetParams> = {}

jest.mock('@cowprotocol/wallet', () => ({
  get IS_SOLANA_WALLET_ENABLED() {
    return mockIsSolanaWalletEnabled
  },
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: () => mockWidgetParams,
}))

function renderUpdater(): string {
  render(
    createElement(Fragment, null, createElement(SolanaAvailabilityUpdater), createElement(SolanaAvailabilityProbe)),
  )

  return screen.getByRole('status').textContent ?? ''
}

function SolanaAvailabilityProbe(): ReactNode {
  return createElement('output', null, String(useIsSolanaAvailable()))
}

describe('SolanaAvailabilityUpdater', () => {
  beforeEach(() => {
    window.location.hash = '#/1/widget/swap'
    mockIsSolanaWalletEnabled = true
    mockWidgetParams = {}
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('opens Solana once the partner opts in', () => {
    mockWidgetParams = { enableSolana: true }

    expect(renderUpdater()).toBe('true')
  })

  it('keeps Solana closed without the opt-in', () => {
    expect(renderUpdater()).toBe('false')
  })

  it('keeps Solana closed when the wallet config was built without it', () => {
    mockIsSolanaWalletEnabled = false
    mockWidgetParams = { enableSolana: true }

    expect(renderUpdater()).toBe('false')
  })
})
