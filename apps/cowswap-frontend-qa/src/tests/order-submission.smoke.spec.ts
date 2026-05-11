import { getAddress, isAddressEqual, type Address } from 'viem'

import { expect, test } from '../fixtures'
import { swapSelectors } from '../helpers/selectors'
import { MAINNET_USDC, MAINNET_WETH, buildMainnetSwapRoute } from '../helpers/tokens'
import { connectInjectedWallet, expectSellAmount, openAccountModal } from '../helpers/trade'
import { waitForNonZeroInputValue } from '../helpers/wait'

import type { Page, TestInfo } from '@playwright/test'

const MOCK_ORDER_UID = `0x${'ab'.repeat(56)}`
const ONE_WETH_IN_WEI = '1000000000000000000'
const MOCK_USDC_BUY_AMOUNT = '2300000000'

interface SubmittedOrderBody {
  appData?: unknown
  appDataHash?: unknown
  buyToken?: unknown
  from?: unknown
  kind?: unknown
  receiver?: unknown
  sellAmount?: unknown
  sellToken?: unknown
  signature?: unknown
  signingScheme?: unknown
}

interface QuoteRequestBody extends SubmittedOrderBody {
  appData?: unknown
  appDataHash?: unknown
  priceQuality?: unknown
  sellAmountBeforeFee?: unknown
}

interface OrderSubmissionCapture {
  submittedOrderBody: SubmittedOrderBody | null
  uploadedAppDataDocument: Record<string, unknown> | null
  uploadedAppDataHash: string | null
}

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }

  throw new Error(`Expected an object payload, received ${typeof value}`)
}

function isSameAddress(value: unknown, address: string): boolean {
  try {
    return typeof value === 'string' && isAddressEqual(getAddress(value), getAddress(address))
  } catch {
    return false
  }
}

function expectSameAddress(value: unknown, address: string, fieldName: string): void {
  expect(isSameAddress(value, address), `${fieldName} should match ${address}`).toBe(true)
}

function getStringOrFallback(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function getFullAppData(value: Record<string, unknown>): string | null {
  const fullAppData = value.fullAppData

  return typeof fullAppData === 'string' ? fullAppData : null
}

function getNormalizedAddress(value: string): Address {
  return getAddress(value)
}

async function clickSwapAction(page: Page): Promise<void> {
  const swapActionButton = page.locator(`${swapSelectors.swapActionButton}, ${swapSelectors.approveTradeButton}`)

  await expect(swapActionButton).toBeVisible({ timeout: 30_000 })
  await expect(swapActionButton).toContainText('Swap')
  await expect(swapActionButton).toBeEnabled()
  await swapActionButton.click()
}

async function interceptDeterministicWrappedQuote(page: Page, walletAddress: string): Promise<void> {
  await page.route('**/mainnet/api/v1/quote', async (route) => {
    const body = toRecord(route.request().postDataJSON()) as QuoteRequestBody

    if (
      body.kind !== 'sell' ||
      body.sellAmountBeforeFee !== ONE_WETH_IN_WEI ||
      !isSameAddress(body.sellToken, MAINNET_WETH) ||
      !isSameAddress(body.buyToken, MAINNET_USDC)
    ) {
      await route.continue()
      return
    }

    const appData = getStringOrFallback(body.appData, '{}')
    const appDataHash = getStringOrFallback(body.appDataHash, `0x${'00'.repeat(32)}`)
    const receiver = getStringOrFallback(body.receiver, walletAddress)
    const signingScheme = getStringOrFallback(body.signingScheme, 'eip712')
    const now = Math.floor(Date.now() / 1000)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        quote: {
          sellToken: getNormalizedAddress(MAINNET_WETH),
          buyToken: getNormalizedAddress(MAINNET_USDC),
          receiver: getNormalizedAddress(receiver),
          sellAmount: ONE_WETH_IN_WEI,
          buyAmount: MOCK_USDC_BUY_AMOUNT,
          validTo: now + 1800,
          appData,
          appDataHash,
          feeAmount: '0',
          gasAmount: '0',
          gasPrice: '0',
          sellTokenPrice: '1',
          kind: 'sell',
          partiallyFillable: false,
          sellTokenBalance: 'erc20',
          buyTokenBalance: 'erc20',
          signingScheme,
        },
        from: getNormalizedAddress(walletAddress),
        expiration: new Date((now + 60) * 1000).toISOString(),
        id: null,
        verified: false,
        protocolFeeBps: '0',
      }),
    })
  })
}

async function interceptWrappedOrderSubmission(
  page: Page,
  walletAddress: string,
  capture: OrderSubmissionCapture,
): Promise<void> {
  await page.route('**/api/v1/app_data/*', async (route) => {
    const request = route.request()

    if (request.method() !== 'PUT') {
      await route.continue()
      return
    }

    expect(request.method()).toBe('PUT')

    capture.uploadedAppDataHash = request.url().split('/').at(-1) ?? null
    capture.uploadedAppDataDocument = toRecord(request.postDataJSON())

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })

  await page.route('**/api/v1/orders', async (route) => {
    const request = route.request()

    expect(request.method()).toBe('POST')

    const body = toRecord(request.postDataJSON())
    capture.submittedOrderBody = body

    expectSameAddress(body.sellToken, MAINNET_WETH, 'sellToken')
    expectSameAddress(body.buyToken, MAINNET_USDC, 'buyToken')
    expect(body.kind).toBe('sell')
    expectSameAddress(body.from, walletAddress, 'from')
    expectSameAddress(body.receiver, walletAddress, 'receiver')
    expect(body.sellAmount).toBe(ONE_WETH_IN_WEI)
    expect(body.signingScheme).toBe('eip712')
    expect(typeof body.signature).toBe('string')
    expect((body.signature as string).length).toBeGreaterThan(0)

    if (capture.uploadedAppDataHash) {
      expect(body.appDataHash).toBe(capture.uploadedAppDataHash)
    }

    const uploadedFullAppData = capture.uploadedAppDataDocument ? getFullAppData(capture.uploadedAppDataDocument) : null
    if (uploadedFullAppData) {
      expect(body.appData).toBe(uploadedFullAppData)
    }

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_ORDER_UID),
    })
  })
}

async function attachOrderSubmissionProof(
  testInfo: TestInfo,
  { submittedOrderBody, uploadedAppDataDocument, uploadedAppDataHash }: OrderSubmissionCapture,
): Promise<void> {
  await testInfo.attach('order-submission-proof', {
    body: Buffer.from(
      JSON.stringify(
        {
          appDataHash: uploadedAppDataHash,
          orderUid: MOCK_ORDER_UID,
          submittedOrderBody,
          uploadedAppDataDocument,
        },
        null,
        2,
      ),
    ),
    contentType: 'application/json',
  })
}

test('order submission smoke: mainnet WETH -> USDC reaches submitted state and recent activity', async ({
  approveWethForCowVaultRelayer,
  page,
  walletAddress,
  wrapNativeToWeth,
}, testInfo) => {
  test.setTimeout(180_000)

  const submissionCapture: OrderSubmissionCapture = {
    submittedOrderBody: null,
    uploadedAppDataDocument: null,
    uploadedAppDataHash: null,
  }

  await interceptWrappedOrderSubmission(page, walletAddress, submissionCapture)
  await interceptDeterministicWrappedQuote(page, walletAddress)

  await wrapNativeToWeth(BigInt(ONE_WETH_IN_WEI))
  await approveWethForCowVaultRelayer(BigInt(ONE_WETH_IN_WEI))

  await page.goto(buildMainnetSwapRoute(MAINNET_WETH, MAINNET_USDC, { orderKind: 'sell', sellAmount: '1' }))

  await connectInjectedWallet(page)
  await expectSellAmount(page, '1')
  await waitForNonZeroInputValue(page.locator(swapSelectors.buyAmountInput))

  await clickSwapAction(page)

  const tradeConfirmationButton = page.locator(swapSelectors.tradeConfirmationButton)
  await expect(tradeConfirmationButton).toBeVisible({ timeout: 30_000 })
  await expect(tradeConfirmationButton).toContainText('Confirm Swap')
  await tradeConfirmationButton.click()

  await expect(page.getByText('Batching orders')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('batched together')).toBeVisible()
  await expect(tradeConfirmationButton).not.toBeVisible()

  await expect
    .poll(() => submissionCapture.uploadedAppDataHash, {
      message: 'Expected app-data upload to happen before order submission',
    })
    .toBeTruthy()

  await expect
    .poll(() => Boolean(submissionCapture.submittedOrderBody), {
      message: 'Expected order submission payload to be captured',
    })
    .toBe(true)

  await attachOrderSubmissionProof(testInfo, submissionCapture)

  await openAccountModal(page)

  await expect(page.getByRole('heading', { name: /Recent Activity/ })).toBeVisible()
  await expect(page.getByText(/sell order/i).first()).toBeVisible()
  await expect(page.locator(':text-is("Open"):visible').first()).toBeVisible()
  await expect(page.locator(':text-is("WETH"):visible').first()).toBeVisible()
  await expect(page.locator(':text-is("USDC"):visible').first()).toBeVisible()
})
