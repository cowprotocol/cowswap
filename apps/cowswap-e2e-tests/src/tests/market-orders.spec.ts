import { formatUnits, parseUnits, type Hex } from 'viem'

import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'
import { mockApproveTransaction } from '../support/mockApproveTransaction'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const CHAIN_ID = CHAIN_IDS.SEPOLIA

test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Market Orders', () => {
  test('[MO-02] Sell order: ERC-20 → ERC-20 @smoke', async ({
    swapPage,
    tradePage,
    wallet,
    confirmModal,
    accountModal,
    mocks,
  }) => {
    // On this Sepolia deployment both test tokens report 18 decimals on-chain (verified via
    // `decimals()`), not USDC's real-world 6 — `support/tokens.ts` disagrees, so raw atoms are
    // computed here via `parseUnits` with an explicit 18 instead of going through `resolveToken`.
    const INITIAL_USDC_BALANCE = parseUnits('1500', 18)
    const BUY_RATE_NUM = 804n
    const BUY_RATE_DEN = 1_000_000n // quote buyAmount ~= 0.804 WETH per 1000 USDC sold, pre-slippage

    // Same technique as [MO-04]: zero out the fee/protocolFeeBps so the posted sellAmount
    // matches the typed amount exactly, keeping the sell-side balance assertion a round number.
    // The buy side still goes through the app's own slippage, so it's asserted dynamically below
    // via `posting.getPostedBuyAmount()` rather than a hardcoded figure.
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const sellAmount = BigInt(defaults.quote.sellAmount as string)
      return {
        ...defaults,
        protocolFeeBps: '0',
        quote: {
          ...defaults.quote,
          buyAmount: ((sellAmount * BUY_RATE_NUM) / BUY_RATE_DEN).toString(),
          feeAmount: '0',
        },
      }
    })

    const posting = tradePage.mockOrderPosting(mocks.cowApi, wallet.address)

    // `usdPrices` defaults every token to $1 — under that assumption this trade's quoted rate
    // looks like a ~99.9% loss and trips the "Confirm Price Impact" dialog. Pricing WETH to match
    // the quote rate keeps the trade looking fair so that extra screen doesn't appear.
    mocks.usdPrices.setPrice(WETH, Number(BUY_RATE_DEN) / Number(BUY_RATE_NUM))

    mocks.balances.set(wallet.address, CHAIN_ID, { [USDC]: INITIAL_USDC_BALANCE, [WETH]: 0n })
    mocks.allowances.set(wallet.address, CHAIN_ID, { [USDC]: INITIAL_USDC_BALANCE })

    await swapPage.goto({ chainId: CHAIN_ID })

    await swapPage.tokens.openInput()
    await swapPage.tokens.searchAndPick('USDC')
    await swapPage.tokens.openOutput()
    await swapPage.tokens.searchAndPick('WETH')

    await expect(swapPage.sellBalance).toHaveAttribute('title', '1500 USDC')
    await expect(swapPage.buyBalance).toHaveAttribute('title', '0 WETH')

    await swapPage.enterSellAmount('1000')
    await swapPage.waitForQuote()

    await swapPage.clickSwap()
    await confirmModal.confirmButton.click()

    await expect(swapPage.orderProgressBarModal).toContainText('Batching orders')
    await swapPage.page.keyboard.press('Escape')
    await expect(swapPage.orderProgressBarModal).toBeHidden()

    await accountModal.open()
    await accountModal.activitiesList.scrollIntoViewIfNeeded()
    await expect(accountModal.activitiesList).toContainText('Open')
    await accountModal.close()

    // Settle the order now that it's posted and confirmed — mirrors [MO-04].
    posting.fulfill(mocks.balances, CHAIN_ID, INITIAL_USDC_BALANCE)

    // Unlike [MO-04] (which keeps the progress modal open throughout), this order was dismissed
    // before settling — reopening it now goes through the surplus-modal queue driven by
    // `PendingOrdersUpdater`'s own polling cadence rather than the still-open modal's watcher, so
    // it needs more room than the default 5s.
    await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })
    await swapPage.page.keyboard.press('Escape')

    await expect(swapPage.sellBalance).toHaveAttribute('title', '500 USDC', { timeout: 15_000 })
    await expect(swapPage.buyBalance).toHaveAttribute(
      'title',
      `${formatUnits(BigInt(posting.getPostedBuyAmount()), 18)} WETH`,
      { timeout: 15_000 },
    )

    await accountModal.open()
    await accountModal.activitiesList.scrollIntoViewIfNeeded()
    await expect(accountModal.activitiesList).toContainText('Filled')
    await accountModal.close()
  })

  test('[MO-03] Buy order: specify exact buy amount (ERC-20) @smoke', async ({
    swapPage,
    tradePage,
    wallet,
    confirmModal,
    accountModal,
    mocks,
  }) => {
    // Same 18-decimals quirk as [MO-02].
    const INITIAL_USDC_BALANCE = parseUnits('1500', 18)
    const RATE = 1000n // 1 WETH = 1000 USDC

    // Mirrors [MO-02]'s technique, but derived from the quote's `buyAmount` instead of its
    // `sellAmount` — for a buy order the typed amount fixes buyAmount exactly, and it's sellAmount
    // that's quoted/slippage-adjusted. Fee/protocolFeeBps stay zeroed so the posted buyAmount
    // matches the typed amount exactly, keeping the buy-side balance assertion a round number.
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const buyAmount = BigInt(defaults.quote.buyAmount as string)
      return {
        ...defaults,
        protocolFeeBps: '0',
        quote: {
          ...defaults.quote,
          sellAmount: (buyAmount * RATE).toString(),
          feeAmount: '0',
        },
      }
    })

    const posting = tradePage.mockOrderPosting(mocks.cowApi, wallet.address)

    // `usdPrices` defaults every token to $1 — pricing WETH to match the quote rate keeps the
    // trade looking fair so the "Confirm Price Impact" dialog doesn't appear, same as [MO-02].
    mocks.usdPrices.setPrice(WETH, Number(RATE))

    mocks.balances.set(wallet.address, CHAIN_ID, { [USDC]: INITIAL_USDC_BALANCE, [WETH]: 0n })
    mocks.allowances.set(wallet.address, CHAIN_ID, { [USDC]: INITIAL_USDC_BALANCE })

    await swapPage.goto({ chainId: CHAIN_ID })

    await swapPage.tokens.openInput()
    await swapPage.tokens.searchAndPick('USDC')
    await swapPage.tokens.openOutput()
    await swapPage.tokens.searchAndPick('WETH')

    await expect(swapPage.sellBalance).toHaveAttribute('title', '1500 USDC')
    await expect(swapPage.buyBalance).toHaveAttribute('title', '0 WETH')

    await swapPage.enterBuyAmount('1')
    await swapPage.waitForQuote()

    await swapPage.clickSwap()
    await confirmModal.confirmButton.click()

    await expect(swapPage.orderProgressBarModal).toContainText('Batching orders')
    await swapPage.page.keyboard.press('Escape')
    await expect(swapPage.orderProgressBarModal).toBeHidden()

    await accountModal.open()
    await accountModal.activitiesList.scrollIntoViewIfNeeded()
    await expect(accountModal.activitiesList).toContainText('Open')
    await accountModal.close()

    // Settle the order now that it's posted and confirmed — mirrors [MO-02].
    posting.fulfill(mocks.balances, CHAIN_ID, INITIAL_USDC_BALANCE)

    // Unlike a still-open progress modal, this order was dismissed before settling — reopening it
    // goes through the surplus-modal queue driven by `PendingOrdersUpdater`'s own polling cadence,
    // so it needs more room than the default 5s — mirrors [MO-02].
    await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })
    await swapPage.page.keyboard.press('Escape')

    // Buy amount is fixed by the order kind — it lands exactly on the typed amount, unlike the
    // sell side, which carries the app's own slippage buffer on top of the quote (see [MO-04]).
    await expect(swapPage.buyBalance).toHaveAttribute('title', '1 WETH', { timeout: 15_000 })
    await expect(swapPage.sellBalance).toHaveAttribute(
      'title',
      `${formatUnits(INITIAL_USDC_BALANCE - BigInt(posting.getPostedSellAmount()), 18)} USDC`,
      { timeout: 15_000 },
    )

    await accountModal.open()
    await accountModal.activitiesList.scrollIntoViewIfNeeded()
    await expect(accountModal.activitiesList).toContainText('Filled')
    await accountModal.close()
  })

  test('[MO-04] Buy order: approval amount includes slippage buffer @smoke', async ({
    swapPage,
    wallet,
    mocks,
    context,
    header,
  }) => {
    // Fixed rate (1 WETH = 2000 USDC) with zero fee/protocolFeeBps keeps the sell side a clean
    // round number derived from whatever buy amount was actually requested
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const buyAmount = BigInt(defaults.quote.buyAmount as string)
      return {
        ...defaults,
        protocolFeeBps: '0',
        quote: { ...defaults.quote, sellAmount: (buyAmount / 2000n).toString(), feeAmount: '0' },
      }
    })
    // Matches the quote's implied rate so the trade doesn't look like a loss against the fixture's
    // flat $1-per-token USD prices, which would otherwise trip the "Confirm Price Impact" dialog.
    mocks.usdPrices.setPrice(WETH, 2000)

    mocks.balances.set(wallet.address, CHAIN_ID, { [WETH]: parseUnits('2', 18), [USDC]: 0n })
    // Precondition: sell token not yet approved.
    mocks.allowances.set(wallet.address, CHAIN_ID, { [WETH]: 0n })

    await swapPage.goto({ chainId: CHAIN_ID, sell: WETH, buy: USDC })
    await swapPage.enterBuyAmount('1000')
    await swapPage.waitForQuote()

    // Select "Partial approval" so the wallet requests a finite amount tied to the trade instead
    // of the default infinite (MaxUint256) approval — only then is there a "maximum sent" figure
    // to compare against.
    const approveModeSelector = swapPage.page.locator('#approve-mode-selector')
    await approveModeSelector.getByText('Partial approval').click()
    const approvalAmount = await approveModeSelector.locator('[title]').getAttribute('title')

    // Faking the approve() end-to-end instead of letting it broadcast for real — see
    // `mockApproveTransaction` for why both `eth_sendTransaction` and `eth_getTransactionReceipt`
    // need stubbing, and at two different layers.
    const approveMock = await mockApproveTransaction({
      context,
      wallet,
      allowances: mocks.allowances,
      chainId: CHAIN_ID,
      token: WETH,
    })

    await swapPage.approveButton.click()

    await expect(header.snackbarPopup).toContainText('Approve WETH', { timeout: 15_000 })

    // Approving a buy order auto-advances into the swap confirm screen. Its "Maximum sent" row is
    // the slippage-adjusted sell amount *without* the buy-order's +1% buffer
    // (`getOrderTypeReceiveAmounts.ts`) — a deliberately different figure from the approve amount
    // (`useAmountsToSignFromQuote.ts`'s `maximumSendSellAmount`, which adds that 1% on top).
    const maximumSentRow = swapPage.page.locator('.confirm-order-amount', { hasText: 'Maximum sent' })
    const maximumSentTitle = await maximumSentRow.locator('[title]').getAttribute('title')
    const [maximumSentDisplayValue] = (maximumSentTitle ?? '').split(' ')
    const maximumSentRaw = parseUnits(maximumSentDisplayValue, 18)

    // What the toggle showed before signing matches the real approve() calldata's amount.
    const [approvalDisplayValue] = (approvalAmount ?? '').split(' ')
    expect(parseUnits(approvalDisplayValue, 18)).toBe(approveMock.getApprovedAmount())

    // The core relationship: approval amount = "Maximum sent" + the 1% buy-order buffer.
    expect(approveMock.getApprovedAmount()).toBe((maximumSentRaw * 101n) / 100n)
  })

  test('[MO-05] Buy order: ETH as sell token (ETH-flow buy not supported) @smoke', async ({ swapPage }) => {
    await swapPage.goto({ chainId: CHAIN_ID })

    await swapPage.tokens.openInput()
    await swapPage.tokens.searchAndPick('ETH')

    // Selling native ETH as an EOA (`isEoaEthFlowAtom`) makes the buy field read-only —
    // there's no separate Sell/Buy order-kind toggle in this UI, so this is the only signal
    // that the order kind is locked to Sell.
    await expect(swapPage.outputAmount).not.toBeEditable()
  })

  test('[MO-06] Swap form: To field amount calculation @smoke', async ({
    setupTestConditions,
    swapPage,
    wallet,
    mocks,
  }) => {
    const BUY_RATE_NUM = 8n
    const BUY_RATE_DEN = 100n // quote rate: 100 USDC -> 8 WETH, i.e. 1 WETH = 12.5 USDC

    // Same technique as [MO-06]: zero out fee/protocolFeeBps so the displayed To-amount is an
    // exact, round multiple of the typed sell amount.
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const sellAmount = BigInt(defaults.quote.sellAmount as string)
      return {
        ...defaults,
        protocolFeeBps: '0',
        quote: {
          ...defaults.quote,
          buyAmount: ((sellAmount * BUY_RATE_NUM) / BUY_RATE_DEN).toString(),
          feeAmount: '0',
        },
      }
    })

    // Pricing WETH 2% below the quote's implied rate ($12.25 instead of $12.50) makes the buy
    // side's fiat value ($98) 2% under the sell side's ($100), producing a deterministic -2%
    // price impact instead of ~0%.
    mocks.usdPrices.setPrice(WETH, 12.25)

    // Set balances/allowances directly (both Sepolia test tokens report 18 decimals on-chain,
    // same quirk as [MO-06]) rather than via `setupTestConditions`, whose `balances`/`allowances`
    // options trust `support/tokens.ts`'s incorrect 6-decimal USDC entry.
    mocks.balances.set(wallet.address, CHAIN_ID, { [USDC]: parseUnits('1000', 18), [WETH]: 0n })
    mocks.allowances.set(wallet.address, CHAIN_ID, { [USDC]: parseUnits('1000', 18) })

    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'swap',
      sellToken: 'USDC',
      buyToken: 'WETH',
      sellAmount: '100',
    })

    // To amount = Sell amount × Price (from BE): 100 USDC × (8/100) = 8 WETH.
    await expect(swapPage.outputAmount).toHaveValue('8')

    // USD estimation shown for both fields.
    await expect(swapPage.sellFiatAmount).toContainText('$100')
    await expect(swapPage.buyFiatAmount).toContainText('$98')

    // Price impact shown near the USD estimation, with its explanatory tooltip.
    await expect(swapPage.priceImpact).toContainText('-2%')
    await swapPage.priceImpactTooltipTrigger.hover()
    await expect(swapPage.page.getByText('Price impact due to current liquidity levels')).toBeVisible()
  })

  test('[MO-07] Swap form: "Receive (incl. fees)" field calculation @smoke', async ({
    setupTestConditions,
    swapPage,
    mocks,
  }) => {
    const RATE = 2000n // 1 WETH = 2000 USDC

    // Non-zero protocol fee (1%) and network cost (also modeled as 1% of the sell amount, in
    // sell-token terms) so both the "Protocol fee" and "Network costs" tooltip rows render with
    // real amounts instead of "Free". Everything below is read back from the DOM rather than
    // hardcoded, so the exact numbers only need to be non-zero, not any particular value.
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const sellAmount = BigInt(defaults.quote.sellAmount as string)
      return {
        ...defaults,
        protocolFeeBps: '100',
        quote: {
          ...defaults.quote,
          feeAmount: (sellAmount / 100n).toString(),
          buyAmount: (sellAmount * RATE).toString(),
        },
      }
    })

    // Matches the quote's implied rate so the trade doesn't look like a loss against the
    // fixture's flat $1-per-token USD prices, which would otherwise trip the "Confirm Price
    // Impact" dialog — same technique as [MO-07].
    mocks.usdPrices.setPrice(WETH, Number(RATE))

    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'swap',
      sellToken: 'WETH',
      buyToken: 'USDC',
      sellAmount: '10',
      balances: { WETH: '10', USDC: '0' },
      allowances: { WETH: '10' },
    })

    await swapPage.receiveAmountTooltipTrigger.hover()

    const tooltipBox = swapPage.page.getByText('Before costs', { exact: true }).locator('xpath=../..')
    await expect(tooltipBox).toBeVisible()
    await expect(tooltipBox.getByText('Protocol fee', { exact: true })).toBeVisible()
    await expect(tooltipBox.getByText('Network costs', { exact: true })).toBeVisible()
    await expect(tooltipBox.getByText('To', { exact: true })).toBeVisible()

    // Both Sepolia test tokens report 18 decimals on-chain — same quirk as [MO-06]/[MO-09].
    const readRowAmount = async (label: string): Promise<bigint> => {
      const title = await tooltipBox
        .getByText(label, { exact: true })
        .locator('xpath=following-sibling::*[1]')
        .locator('[title]')
        .getAttribute('title')
      const [value] = (title ?? '').split(' ')
      return parseUnits(value, 18)
    }

    const beforeCosts = await readRowAmount('Before costs')
    const protocolFee = await readRowAmount('Protocol fee')
    const networkCosts = await readRowAmount('Network costs')
    const toAmount = await readRowAmount('To')

    // The core relationship: To = Before costs − Network costs − Protocol fee.
    expect(toAmount).toBe(beforeCosts - networkCosts - protocolFee)

    // The main "Receive (incl. fees)" field displays the same amount as the tooltip's "To" row.
    const receiveTitle = await swapPage.receiveAmountValue.getAttribute('title')
    const [receiveValue] = (receiveTitle ?? '').split(' ')
    expect(parseUnits(receiveValue, 18)).toBe(toAmount)
  })
})
