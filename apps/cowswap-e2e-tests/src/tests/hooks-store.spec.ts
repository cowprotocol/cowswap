import { encodeFunctionData, parseUnits } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { test, expect } from '../fixtures'
import { generateOrderId } from '../mocks/orders'
import { mockBridgeSupportedTokens } from '../support/mockBridgeSupportedTokens'
import { mockFixedRateQuote } from '../support/mockFixedRateQuote'
import { mockHookLogo } from '../support/mockHookLogo'
import { mockHooksSimulation } from '../support/mockHooksSimulation'
import { mockTokenLogos } from '../support/mockTokenLogos'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const WXDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
const CHAIN_ID = SupportedChainId.SEPOLIA
const GNOSIS_CHAIN_ID = SupportedChainId.GNOSIS_CHAIN
// The real (not this suite's usual fake Sepolia test token) Mainnet addresses — see [CS-136]'s
// Part 2 for why Mainnet, not Sepolia, has to be the sell chain there.
const MAINNET_CHAIN_ID = SupportedChainId.MAINNET
const MAINNET_WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

test.describe('Hooks store', () => {
  test('[CS-129] Enable Hooks via settings toggle @smoke', async ({ swapPage }) => {
    await swapPage.goto({ chainId: CHAIN_ID })

    // `SettingsBox`/`Toggle` render the real `<input type="checkbox">` inert (0×0,
    // `pointer-events: none`) and rely on the enclosing `<label>` (`SettingsBoxWrapper`) to forward
    // clicks to it — the actual click target is the wrapper span (`#toggle-hooks-mode-button`
    // itself), not the checkbox.
    const hooksToggle = swapPage.page.locator('#toggle-hooks-mode-button')
    const hooksCheckbox = hooksToggle.locator('input[type="checkbox"]')

    // Enabling Hooks adds a new top-level nav item (`useMenuItems`'s `HOOKS_STORE_MENU_ITEM`)
    // alongside Swap/Limit/TWAP, routing to a `/swap/hooks` URL — there's no tab *inside* the swap
    // widget itself. At this viewport `TradeWidgetForm`'s `showDropdown` is true (a connected
    // wallet renders the "My orders" button, one of its triggers), so these nav items only exist in
    // the DOM behind the collapsed "Trading mode" dropdown, not as a plain visible link row.
    const hooksLink = swapPage.page.locator('a[href*="/swap/hooks"]')

    // Precondition: Hooks starts disabled, so its nav entry isn't rendered yet.
    await swapPage.tradingModeDropdown.click()
    await expect(hooksLink).toBeHidden()

    // A full reload (not another `goto`, which only changes the hash on this single-page app and
    // wouldn't remount anything) is the simplest way to close the dropdown before opening settings —
    // the dropdown's own overlay covers the header, including the settings gear icon, while open.
    await swapPage.page.reload()

    await swapPage.page.locator('#open-settings-dialog-button').click()
    await expect(hooksCheckbox).not.toBeChecked()

    await hooksToggle.click()
    await expect(hooksCheckbox).toBeChecked()
    await swapPage.page.keyboard.press('Escape')

    await swapPage.tradingModeDropdown.click()
    await expect(hooksLink).toBeVisible()

    // Setting persists across a refresh — it's backed by `state.user.hooksEnabled`, written to
    // `localStorage` by `redux-localstorage-simple` with a 1s debounce (`legacy/state/index.ts`).
    // Reloading before that debounce fires would reload the pre-toggle value, so wait for the
    // write to actually land first instead of guessing a timeout.
    await expect
      .poll(() => swapPage.page.evaluate(() => localStorage.getItem('redux_localstorage_simple_user')))
      .toContain('"hooksEnabled":true')

    await swapPage.page.reload()

    await swapPage.page.locator('#open-settings-dialog-button').click()
    await expect(hooksCheckbox).toBeChecked()
    await swapPage.page.keyboard.press('Escape')

    await swapPage.tradingModeDropdown.click()
    await expect(hooksLink).toBeVisible()
    await hooksLink.click()

    await expect(swapPage.page).toHaveURL(/\/swap\/hooks(\/|$|\?)/)
    // The Hooks tab is the same swap widget, with these hook-management buttons added around the
    // form — there's no separate "browse hooks" landing screen at this route.
    await expect(swapPage.page.getByText('Add Pre-Hook Action')).toBeVisible()
    await expect(swapPage.page.getByText('Add Post-Hook Action')).toBeVisible()
  })

  test('[CS-136] Hooks: cross-chain swaps are not available @smoke', async ({ swapPage, wallet, mocks, context }) => {
    // Resolving WXDAI@Gnosis as a currency relies on the real, live Gnosis token list — same as
    // every other test in this suite resolves its Sepolia WETH/USDC via the real, unmocked
    // per-chain token list (there's no `mocks.tokenLists` fixture in this app; token lists aren't
    // mocked anywhere here). The one endpoint that DOES need stubbing is the bridge provider's own
    // "is this a valid destination token" check, which otherwise hits a real, unmocked
    // `bff.barn.cow.fi` endpoint (confirmed by tracing actual network requests — see
    // `mockBridgeSupportedTokens`'s own doc comment). No live Gnosis RPC call is involved either
    // way, since the test never submits a trade, only inspects picker/URL/nav state.
    await mockBridgeSupportedTokens(context, [
      { address: WXDAI, symbol: 'WXDAI', name: 'Wrapped XDAI', decimals: 18, chainId: GNOSIS_CHAIN_ID },
    ])
    // The default quote fixture's WETH/USDC rate is a real recorded snapshot (~546.99 USDC per
    // WETH), not an arbitrary placeholder — leave it as-is rather than overriding it with an
    // artificial rate. `mocks.usdPrices` defaults every token to $1 though, which doesn't match
    // that real ratio and renders an absurd price-impact percentage; match it here instead.
    mocks.usdPrices.setPrice(WETH, 546.9898499813039)

    // Part 1: the buy-token picker on the Hooks tab never offers another chain to pick from.
    await swapPage.page.goto(`/#/${CHAIN_ID}/swap/hooks/${WETH}/${USDC}`)
    await swapPage.unlockIfNeeded()
    await expect(swapPage.page.getByText('Add Pre-Hook Action')).toBeVisible()

    await swapPage.tokens.openInput()
    await swapPage.tokens.searchAndPick('WETH')
    await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WETH')

    await swapPage.tokens.openOutput()
    // `useChainPanelState`'s chain-tab (`ChainButton` rows, e.g. "Gnosis") only renders when
    // `isBridgingEnabled` is true, which `BridgingEnabledUpdater` hardcodes to false off the
    // Swap route — so there's no chain row to pick from at all on Hooks, scoped to the picker
    // itself since the header's own network switcher also renders a "Gnosis" label elsewhere.
    await expect(swapPage.tokens.currencyList.getByText('Gnosis', { exact: true })).not.toBeVisible()
    await swapPage.page.keyboard.press('Escape')
    await swapPage.tokens.currencyList.waitFor({ state: 'hidden' })

    // Part 2: a cross-chain buy token set on Swap is reset when navigating to Hooks via the
    // in-app tab link (`useGetTradeUrlParams` — the one path this ticket's reset IS wired up on).
    //
    // This runs on Mainnet, not Sepolia: `InvalidBridgeOutputUpdater.utils.ts`'s
    // `getUnsupportedBridgePairPatch` requires the CURRENT (sell) chain to itself be one of
    // `bridgingSdk.getTargetNetworks()`'s own supported chains, and Sepolia (a testnet) never is —
    // it strips any cross-chain pair back out unconditionally and deterministically the moment the
    // sell chain is Sepolia, regardless of mocks or timing (the currency picker enforces the same
    // rule cosmetically: every non-Sepolia chain row, Gnosis included, renders permanently disabled
    // when Sepolia is the source — see `chainsState.ts`'s `sourceSupported` check). So this part
    // sells the real Mainnet WETH (not this suite's usual fake Sepolia test token) to the real
    // Gnosis WXDAI instead, both chains the app actually allows for bridging.
    mocks.balances.set(wallet.address, MAINNET_CHAIN_ID, { [MAINNET_WETH]: parseUnits('10', 18) })
    // Real Mainnet USDC has 6 decimals, unlike this suite's 18-decimal Sepolia "USDC" test token —
    // `mockFixedRateQuote`'s plain `sellAmount * numerator / denominator` is decimals-agnostic (see
    // the cross-chain bridging note in AGENTS.md), so the ratio is adjusted for that here: 1 WETH
    // (10^18 raw) at this rate produces 2500 USDC as 2500×10^6 raw atoms — matching the `usdPrices`
    // override below, for a clean (not fixture-fee-skewed) ~0% price impact.
    mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: 2500n, denominator: 1_000_000_000_000n } })
    mocks.usdPrices.setPrice(MAINNET_WETH, 2500)

    await wallet.openApp({ chainId: MAINNET_CHAIN_ID, sell: MAINNET_WETH })
    await swapPage.unlockIfNeeded()
    await swapPage.enterSellAmount('1')
    await swapPage.waitForQuote()

    // Setting the cross-chain pair via URL races `InvalidBridgeOutputUpdater`'s OWN
    // `useBridgeSupportedTokens` SWR fetch for this brand new (sourceChainId, targetChainId) pair:
    // read on the very first render, before that fetch has even reported itself as loading, "no
    // data yet" looks identical to "confirmed no route", so it strips the just-set
    // `outputCurrencyId`/`targetChainId` back out of the URL within a render or two — before the
    // (mocked) fetch resolves. Navigating to the exact same bridging URL a second time sidesteps
    // it deterministically: the first attempt's fetch already warmed the SWR cache for this exact
    // pair (independent of the URL/rawState that attempt also reset), so the second attempt's
    // render sees resolved data immediately instead of racing it.
    const gotoBridgingPair = async (): Promise<void> => {
      await swapPage.page.goto(`/#/${MAINNET_CHAIN_ID}/swap/${MAINNET_WETH}/${WXDAI}?targetChainId=${GNOSIS_CHAIN_ID}`)
    }
    await gotoBridgingPair()
    await gotoBridgingPair()
    await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: WXDAI')

    // Make this a genuinely active bridge trade (quote loaded for the new pair), not just tokens
    // picked with an empty form — the reset-on-navigate behavior below should hold for a real,
    // in-flight bridge quote, not merely for two currency IDs sitting unused in the URL. The sell
    // amount itself carries over from the plain pair above (it's not reset by a currency change),
    // so it only needs to be typed once.
    await swapPage.waitForQuote()

    // The Hooks nav link only renders once `state.user.hooksEnabled` is set (same
    // `redux-localstorage-simple`-backed flag [CS-129] toggles via Settings) — set it directly
    // rather than re-exercising that toggle flow, and reload so the store rehydrates with it.
    // Merge into the existing persisted state instead of replacing it outright, so other
    // `state.user` fields written earlier (slippage, recipient, ...) survive the reload.
    await swapPage.page.evaluate(() =>
      localStorage.setItem(
        'redux_localstorage_simple_user',
        JSON.stringify({
          ...JSON.parse(localStorage.getItem('redux_localstorage_simple_user') || '{}'),
          hooksEnabled: true,
        }),
      ),
    )
    await swapPage.page.reload()
    await swapPage.unlockIfNeeded()
    await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: WXDAI')

    // Same viewport quirk as [CS-129]: the trade-mode tabs are collapsed behind this dropdown.
    const hooksLink = swapPage.page.locator('a[href*="/swap/hooks"]')
    await swapPage.tradingModeDropdown.click()
    await hooksLink.click()

    await expect(swapPage.page).toHaveURL(/\/swap\/hooks(\/|$|\?)/)
    await expect(swapPage.page).not.toHaveURL(/targetChainId=/)
    // The whole trade form resets to the Mainnet Hooks-tab default pair (WETH/USDC) — not just
    // the buy side — per `getDefaultTradeRawState`: `useGetTradeUrlParams` keeps `inputCurrencyId`
    // as-is when leaving a bridging Swap (already WETH here, so unchanged) and falls back
    // `outputCurrencyId` to the target widget's default (USDC), dropping `targetChainId` entirely.
    await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WETH')
    await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: USDC')
    // The sell amount typed on the Swap tab carries over as-is (only the currencies reset) — no
    // need to re-enter it here.
    await expect(swapPage.inputAmount).toHaveValue('1')

    // The reset pair is same-chain (Mainnet/Mainnet), so this is an ordinary quote, not a bridge
    // one — no "No routes found" (that's a bridge-route error) should linger from the pre-reset
    // cross-chain state, and the carried-over sell amount should have a fresh, non-bridge quote
    // automatically recalculated for it against the reset pair.
    await expect(swapPage.page.getByText('No routes found')).not.toBeVisible()
    await swapPage.waitForQuote()
    // `mockFixedRateQuote`'s pinned rate applies here too (it's a global `quote` override, not
    // scoped to the bridge leg), so 1 WETH at 2500 USDC/WETH, zero fee, is exact — and, since
    // `usdPrices` above matches that same rate, a clean ~0% price impact rather than the
    // fixture/$1-default mismatch's absurd one.
    await expect(swapPage.outputAmount).toHaveValue('2500')
    await expect(swapPage.priceImpact).toContainText('(0%)')

    // The reset form isn't just quoted, it's genuinely actionable — the approve/swap button
    // (WETH allowance is unset for this wallet, same describe-block default as every other test
    // here, so the partial/full approval selector renders too) actually becomes enabled, proving
    // this isn't a partially-broken post-reset state that merely looks quoted.
    await expect(swapPage.approveModeSelector).toBeVisible()
    await expect(swapPage.primaryActionButton).toBeEnabled()
  })

  test('[CS-131] Add a Pre-hook to a swap order @smoke', async ({
    swapPage,
    wallet,
    confirmModal,
    accountModal,
    mocks,
    context,
  }) => {
    // The real CoW Protocol GPv2VaultRelayer address (same across chains) — used only as the
    // `approve()` spender encoded into the hook's calldata below, to represent a realistic
    // "token approval" pre-hook per the ticket's example, not because it's ever actually called
    // (the hook is never executed on a real chain in this mocked test).
    const VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
    const HOOK_GAS_LIMIT = '45000'
    const approveCalldata = encodeFunctionData({
      abi: [
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'approve',
      args: [VAULT_RELAYER, parseUnits('1', 18)],
    })

    // Realistic quote: the default fixture's real recorded WETH/USDC rate (~546.99, see [CS-136]
    // for how this was confirmed), not an artificial 1:1 — matching `usdPrices` to it avoids the
    // otherwise-absurd price-impact percentage that mismatch produces.
    mocks.usdPrices.setPrice(WETH, 546.9898499813039)
    mocks.allowances.set(wallet.address, CHAIN_ID, { [WETH]: parseUnits('10', 18) })
    // Every test in this file needs its own balance — there's no `beforeEach` default here (unlike
    // `market-orders.spec.ts`).
    mocks.balances.set(wallet.address, CHAIN_ID, { [WETH]: parseUnits('10', 18), [USDC]: 0n })
    // None of these real endpoints was mocked before this test — see each helper's own doc
    // comment for what they replace and why (a 403'ing token-logo CDN, the hook's unmocked
    // GitHub-hosted logo, and a live Tenderly simulation call the confirmation screen makes
    // once a hook is attached).
    await mockTokenLogos(context)
    await mockHookLogo(context)
    await mockHooksSimulation(context)

    // Enable Hooks via the Settings toggle first (same mechanic [CS-129] exercises in full),
    // then navigate to the Hooks tab through the UI — not a direct URL shortcut.
    await swapPage.goto({ chainId: CHAIN_ID })
    await swapPage.page.locator('#open-settings-dialog-button').click()
    await swapPage.page.locator('#toggle-hooks-mode-button').click()
    await swapPage.page.keyboard.press('Escape')

    // Same viewport quirk as [CS-129]: the trade-mode tabs are collapsed behind this dropdown.
    const hooksLink = swapPage.page.locator('a[href*="/swap/hooks"]')
    await swapPage.tradingModeDropdown.click()
    await hooksLink.click()
    await expect(swapPage.page).toHaveURL(/\/swap\/hooks(\/|$|\?)/)
    await expect(swapPage.page.getByText('Add Pre-Hook Action')).toBeVisible()

    await swapPage.enterSellAmount('1')
    await swapPage.waitForQuote()

    // Opens `HookRegistryList` — a searchable Hook Store modal listing both built-in ("Build your
    // own hook", `BUILD_CUSTOM_HOOK` in `hookRegistry.tsx`) and custom hook dapps.
    await swapPage.page.getByText('Add Pre-Hook Action', { exact: true }).click()
    await swapPage.page.getByPlaceholder('Search hooks by title or description').fill('Build your own hook')
    // `HookListItem` renders the whole `<li>` card clickable to *open its details page*
    // (`onOpenDetails`) — only the "Open" button inside it actually selects the dapp
    // (`onSelect`) and opens `BuildHookApp`'s form.
    const hookCard = swapPage.page.locator('li', { hasText: 'Build your own hook' })
    await hookCard.getByRole('button', { name: 'Open', exact: true }).click()

    // `BuildHookApp`'s plain form: `<input name="target">`, `<input name="gasLimit">`,
    // `<textarea name="callData">` — no ids/`data-testid`, matched by their `name` attribute.
    await swapPage.page.locator('input[name="target"]').fill(WETH)
    await swapPage.page.locator('input[name="gasLimit"]').fill(HOOK_GAS_LIMIT)
    await swapPage.page.locator('textarea[name="callData"]').fill(approveCalldata)
    await swapPage.page.getByRole('button', { name: 'Add Pre-hook', exact: true }).click()

    // The Hook Store modal closes back to the swap form once `context.addHook` resolves.
    await swapPage.page.getByPlaceholder('Search hooks by title or description').waitFor({ state: 'hidden' })
    await expect(swapPage.page.getByText('Build your own hook', { exact: true })).toBeVisible()

    const orderId = generateOrderId()
    await mocks.orders.expectOrderToBePosted({
      orderId,
      owner: wallet.address,
      trigger: async () => {
        await swapPage.clickSwap()

        // `TradeConfirmation` renders `OrderHooksDetails` with `isTradeConfirmation`, which is what
        // triggers the Tenderly simulation fetch — expand the "Hooks" summary, then the individual
        // hook row, to reach the "Simulation successful" text `HookItem` renders off a `status: true`
        // response (mocked above), plus its dapp logo actually loading (not a broken/letter fallback).
        const confirmationModal = swapPage.page.locator('#trade-confirmation')
        // `HookTag` renders "PRE" and its count (`<b>1</b>`) as one element's text ("PRE 1"), so an
        // exact match on "PRE" alone doesn't match — match the whole rendered pattern instead of a
        // bare substring, which could resolve more than one node and hit a strict-mode error.
        await confirmationModal.getByText(/^PRE\s*\d+$/).click()
        const hookRow = confirmationModal.getByText('Build your own hook', { exact: true })
        await expect(hookRow).toBeVisible()
        // This particular logo (`hookDappsRegistry.ts`'s `BUILD_CUSTOM_HOOK.image`) is mocked via
        // `mockHookLogo` above, but the `<img>` load is still async, so poll instead of a single
        // immediate read.
        const hookLogo = confirmationModal.locator('img[alt="Build your own hook"]')
        await expect(hookLogo).toBeVisible()
        await expect
          .poll(() => hookLogo.evaluate((img: HTMLImageElement) => img.naturalWidth), { timeout: 15_000 })
          .toBeGreaterThan(0)
        await hookRow.click()
        await expect(confirmationModal.getByText('Simulation successful', { exact: true })).toBeVisible()

        await confirmModal.confirm()
      },
    })

    await expect(swapPage.orderProgressBarModal).toContainText('Batching orders')
    mocks.orders.fulfillOrder(orderId, mocks.balances, CHAIN_ID, parseUnits('10', 18), 0n)
    await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })
    await swapPage.page.keyboard.press('Escape')

    // `mocks.orders`'s `buildOpenOrder` already echoes the posted `appData` back as `fullAppData`
    // on the mocked `accountOrders`/`order` endpoints — `OrderHooksDetails`
    // (`common/containers/OrderHooksDetails`) decodes that same field to render this "Hooks"
    // summary in `ActivityDetails`, so this is a genuine round-trip check: the hook was correctly
    // built into the signed order's appData, not just added to local form state.
    await accountModal.open()
    await expect(accountModal.activitiesList).toContainText('Hooks')
    await expect(accountModal.activitiesList).toContainText('PRE')
  })
})
