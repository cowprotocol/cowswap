import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { msg } from '@lingui/core/macro'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { CostsAndFeesBreakdown } from './CostsAndFeesBreakdown.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() =>
      ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
      }) as unknown as MediaQueryList)
})

const ETH = new Token(1, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 18, 'ETH', 'Ether')
const USDC = new Token(1, '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC', 'USD Coin')
const UNKNOWN = '0x1111111111111111111111111111111111111111'

function renderBreakdown(costs: Parameters<typeof CostsAndFeesBreakdown>[0]['costs']): void {
  render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <CostsAndFeesBreakdown costs={costs} tokens={[USDC]} />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('CostsAndFeesBreakdown', () => {
  it('shows the per-token totals and the itemised list', () => {
    const lineItems = [
      { label: msg`Network costs`, tokenAddress: getAddressKey(ETH.address), amount: 1000000000000000n },
      { label: msg`Protocol fee`, tokenAddress: getAddressKey(USDC.address), amount: 2500000n },
    ]

    renderBreakdown({
      lineItems,
      totals: [
        [getAddressKey(ETH.address), 1000000000000000n],
        [getAddressKey(USDC.address), 2500000n],
      ],
      nativeToken: ETH,
    })

    expect(screen.getByText('Show more')).not.toBeNull()
    expect(screen.getByText('Network costs')).not.toBeNull()
    expect(screen.getByText('Protocol fee')).not.toBeNull()
    expect(screen.getAllByText(/2\.5/).length).toBeGreaterThan(0)
  })

  it('omits the list when there is only the network costs', () => {
    renderBreakdown({
      lineItems: [{ label: msg`Network costs`, tokenAddress: getAddressKey(ETH.address), amount: 1n }],
      totals: [[getAddressKey(ETH.address), 1n]],
      nativeToken: ETH,
    })

    expect(screen.queryByText('Show more')).toBeNull()
  })

  it('marks an amount exceeding MaxUint256 in a known token as raw instead of throwing', () => {
    const tooLarge = 2n ** 256n

    expect(() =>
      renderBreakdown({
        lineItems: [
          { label: msg`Network costs`, tokenAddress: getAddressKey(ETH.address), amount: 1n },
          { label: msg`Protocol fee`, tokenAddress: getAddressKey(USDC.address), amount: tooLarge },
        ],
        totals: [
          [getAddressKey(ETH.address), 1n],
          [getAddressKey(USDC.address), tooLarge],
        ],
        nativeToken: ETH,
      }),
    ).not.toThrow()

    expect(screen.getAllByText(new RegExp(`${tooLarge.toString()} \\(raw\\)`)).length).toBeGreaterThan(0)
  })

  it('marks an amount in an unknown token as raw', () => {
    renderBreakdown({
      lineItems: [
        { label: msg`Network costs`, tokenAddress: getAddressKey(ETH.address), amount: 1n },
        { label: msg`Protocol fee`, tokenAddress: getAddressKey(UNKNOWN), amount: 42n },
      ],
      totals: [
        [getAddressKey(ETH.address), 1n],
        [getAddressKey(UNKNOWN), 42n],
      ],
      nativeToken: ETH,
    })

    expect(screen.getAllByText(/42 \(raw\)/).length).toBeGreaterThan(0)
  })

  describe('in the surplus token', () => {
    const lineItems = [
      { label: msg`Network costs`, tokenAddress: getAddressKey(ETH.address), amount: 1000000000000000n },
      { label: msg`Protocol fee`, tokenAddress: getAddressKey(USDC.address), amount: 2500000n },
    ]
    const totals: Array<[ReturnType<typeof getAddressKey>, bigint]> = [
      [getAddressKey(ETH.address), 1000000000000000n],
      [getAddressKey(USDC.address), 2500000n],
    ]
    const approximate = {
      token: USDC,
      items: [
        { amount: 1234000n, isApproximate: true },
        { amount: 2500000n, isApproximate: false },
      ],
      total: 3734000n,
      isApproximate: true,
    }

    it('shows a single approximate total and every row in the surplus token', () => {
      renderBreakdown({ lineItems, totals, nativeToken: ETH, surplusCosts: approximate })

      expect(screen.getAllByText(/≈/)).toHaveLength(2)
      expect(screen.getAllByText(/3\.734/)).toHaveLength(1)
      expect(screen.getAllByText(/1\.234/)).toHaveLength(1)
      expect(screen.getAllByText(/2\.5/)).toHaveLength(1)
      expect(screen.queryByText(/ETH/)).toBeNull()
    })

    it('shows the actual native network costs in a tooltip on the approximate row', async () => {
      renderBreakdown({ lineItems, totals, nativeToken: ETH, surplusCosts: approximate })

      fireEvent.mouseEnter(screen.getByText(/1\.234/))

      const tooltip = await screen.findByText(/in network costs\. Shown in USDC at the current price\./)
      expect(tooltip.textContent).toMatch(/^Paid 0\.001 ETH in network costs\. Shown in USDC at the current price\.$/)
    })

    it('shows the same tooltip on the approximate total', async () => {
      renderBreakdown({ lineItems, totals, nativeToken: ETH, surplusCosts: approximate })

      fireEvent.mouseEnter(screen.getByText(/3\.734/))

      expect(await screen.findByText(/in network costs\. Shown in USDC at the current price\./)).not.toBeNull()
    })

    it('omits the approximation mark when every conversion is exact', () => {
      renderBreakdown({
        lineItems,
        totals,
        nativeToken: ETH,
        surplusCosts: {
          ...approximate,
          items: approximate.items.map((item) => ({ ...item, isApproximate: false })),
          isApproximate: false,
        },
      })

      expect(screen.queryByText(/≈/)).toBeNull()
      expect(screen.getAllByText(/3\.734/)).toHaveLength(1)
    })
  })
})
