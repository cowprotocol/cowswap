import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

const ONDO_USDY = '0x96f6ef951840721adbf46ac996b59e0235cb985c'

test.describe('RWA (Ondo & xStocks)', () => {
  test('[RW-01] Ondo & xStocks available on Mainnet @smoke', async ({ swapPage, wallet, mocks }) => {
    mocks.tokenLists.setListForChain(CHAIN_IDS.MAINNET, {
      tokens: [
        { address: ONDO_USDY, symbol: 'USDY', name: 'Ondo USDY', decimals: 18, chainId: 1 },
        {
          address: '0x0000000000000000000000000000000000000001',
          symbol: 'AAPLx',
          name: 'Backed Apple',
          decimals: 18,
          chainId: 1,
        },
      ],
    })

    await wallet.connectAsEOA({ chainId: CHAIN_IDS.MAINNET })
    await swapPage.goto({ chainId: CHAIN_IDS.MAINNET })
    await swapPage.tokens.openOutput()
    await swapPage.tokens.searchAndPick('USDY')
    await expect(swapPage.page.getByText('USDY')).toBeVisible()
  })
})
