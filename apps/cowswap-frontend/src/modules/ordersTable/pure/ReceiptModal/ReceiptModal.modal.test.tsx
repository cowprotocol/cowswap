import type { ElementType, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { buildPriceFromCurrencyAmounts } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Fraction } from '@cowprotocol/currency'

import { fireEvent, render, screen, within } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { TwapOrderItem } from 'modules/twap'

import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { ReceiptModal } from './ReceiptModal.modal'

import { ordersMock } from '../../test/ordersTable.mock'

jest.mock('@cowprotocol/common-hooks', () => {
  const actual = jest.requireActual<typeof import('@cowprotocol/common-hooks')>('@cowprotocol/common-hooks')

  return { ...actual, useMediaQuery: () => false, useTimeAgo: () => 'rerender tick' }
})

jest.mock('common/hooks/useCategorizeRecentActivity', () => ({
  isPending: ({ status }: { status: string }) => status === 'pending',
}))

jest.mock('modules/trade', () => ({
  ConfirmAmounts: jest.requireActual('modules/trade/pure/TradeConfirmation/ConfirmAmounts').ConfirmAmounts,
}))

jest.mock('@cowprotocol/tokens', () => ({
  TokenLogo: ({ size }: { size: number }) => <span data-testid="token-logo" data-size={size} />,
}))

jest.mock('@cowprotocol/assets/cow-swap/safe-logo.svg', () => 'safe-logo.svg')

jest.mock('@cowprotocol/ui', () => {
  const actual = jest.requireActual<typeof import('@cowprotocol/ui')>('@cowprotocol/ui')

  return {
    ...actual,
    BottomDrawer: Object.assign(({ children }: { children: ReactNode }) => <div>{children}</div>, {
      Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    }),
    BottomDrawerOrDialog: ({
      children,
      isDrawer,
      isOpen,
      onOpenChange,
      variant,
    }: {
      children: ReactNode
      isDrawer: boolean
      isOpen: boolean
      onOpenChange(open: boolean): void
      variant?: string
    }) => (
      <div
        data-testid="bottom-drawer-or-dialog"
        data-is-drawer={String(isDrawer)}
        data-is-open={String(isOpen)}
        data-variant={variant}
      >
        <button type="button" aria-label="Dismiss overlay" onClick={() => onOpenChange(false)} />
        {children}
      </div>
    ),
    Dialog: Object.assign(({ children }: { children: ReactNode }) => <div>{children}</div>, {
      Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    }),
    Icon: () => <span aria-hidden />,
    InlineBanner: ({ children }: { children: ReactNode }) => <aside>{children}</aside>,
    Modal: {
      Root: ({ children }: { children: ReactNode }) => <div data-testid="modal-root">{children}</div>,
      Content: ({ children, $noPadding }: { children: ReactNode; $noPadding?: boolean }) => (
        <main data-testid="modal-content" data-no-padding={String($noPadding)}>
          {children}
        </main>
      ),
    },
    ModalHeader: ({
      closeOnEscape,
      closeAriaLabel,
      onClose,
      rightSlot,
      title,
      titleAs: Title = 'div',
    }: {
      closeOnEscape?: boolean
      closeAriaLabel?: string
      onClose?(): void
      rightSlot?: ReactNode
      title?: ReactNode
      titleAs?: ElementType
    }) => (
      <header data-close-on-escape={String(closeOnEscape)}>
        <Title>{title}</Title>
        {rightSlot}
        <button type="button" aria-label={closeAriaLabel} onClick={onClose}>
          Close
        </button>
      </header>
    ),
  }
})

jest.mock('common/pure/CustomRecipientWarningBanner', () => ({
  CustomRecipientWarningBanner: () => <div>Custom recipient warning</div>,
}))

jest.mock('common/pure/SafeWalletLink', () => ({
  SafeWalletLink: () => <a href="https://app.safe.global">View in Safe</a>,
}))

jest.mock('../ContextMenu/OrderContextMenu.pure', () => ({
  OrderContextMenu: ({
    ariaLabel,
    showCancellationModal,
  }: {
    ariaLabel?: string
    showCancellationModal?: (() => void) | null
  }) => (
    <div>
      <button type="button" aria-label={ariaLabel} />
      {showCancellationModal ? (
        <button type="button" onClick={showCancellationModal}>
          Cancel order
        </button>
      ) : null}
    </div>
  ),
}))

i18n.load('en-US', {})
i18n.activate('en-US')

interface RenderReceiptOptions {
  alternativeOrderModalContext?: { isEdit: boolean; showAlternativeOrderModal(): void } | null
  estimatedExecutionPrice?: Fraction | null
  isTwapPartOrder?: boolean
  onDismiss?: () => void
  order?: ParsedOrder
  showCancellationModal?: () => void
  twapOrder?: TwapOrderItem | null
}

function getBaseOrder(): ParsedOrder {
  const order = ordersMock.find(({ id }) => id === '4')

  if (!order) throw new Error('Expected fulfilled order mock')

  return order
}

function getOrder(overrides: Partial<ParsedOrder> = {}): ParsedOrder {
  const order = getBaseOrder()

  return {
    ...order,
    feeAmount: '1000000',
    executionData: {
      ...order.executionData,
      filledPercentDisplay: '100',
      fullyFilled: true,
      partiallyFilled: false,
      surplusAmount: new BigNumber('1000000'),
      surplusPercentage: new BigNumber('0.0017'),
    },
    ...overrides,
  }
}

function renderReceipt(options: RenderReceiptOptions = {}): ReturnType<typeof render> {
  const order = options.order ?? getOrder()
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount)
  const rawSellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const limitPrice = buildPriceFromCurrencyAmounts(rawSellAmount, buyAmount)

  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <ReceiptModal
          isOpen
          order={order}
          receiverEnsName={null}
          twapOrder={options.twapOrder ?? null}
          isTwapPartOrder={options.isTwapPartOrder ?? false}
          chainId={SupportedChainId.GNOSIS_CHAIN}
          onDismiss={options.onDismiss ?? jest.fn()}
          buyAmount={buyAmount}
          limitPrice={limitPrice}
          executionPrice={order.executionData.executedPrice}
          estimatedExecutionPrice={options.estimatedExecutionPrice ?? null}
          alternativeOrderModalContext={options.alternativeOrderModalContext}
          showCancellationModal={options.showCancellationModal}
        />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('ReceiptModal', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the filled receipt anatomy and keeps overlay dismissal with the owner primitive', () => {
    const onDismiss = jest.fn()
    const showAlternativeOrderModal = jest.fn()
    const order = getOrder()
    const expectedSellAmount = getSellAmountWithFee(order)

    renderReceipt({
      order,
      onDismiss,
      alternativeOrderModalContext: { isEdit: false, showAlternativeOrderModal },
    })

    const overlay = screen.getByTestId('bottom-drawer-or-dialog')
    const header = screen.getByRole('banner')

    expect(overlay.getAttribute('data-is-drawer')).toBe('false')
    expect(overlay.getAttribute('data-is-open')).toBe('true')
    expect(overlay.getAttribute('data-variant')).toBe('narrow')
    expect(screen.getByTestId('modal-root')).not.toBeNull()
    expect(screen.getByTestId('modal-content').getAttribute('data-no-padding')).toBe('true')
    expect(within(header).getByText('Order receipt')).not.toBeNull()
    expect(within(header).getByText('Filled')).not.toBeNull()
    expect(screen.getAllByRole('heading', { name: /^Order receipt/ })).toHaveLength(1)
    expect(header.getAttribute('data-close-on-escape')).toBe('false')
    expect(screen.getAllByTestId('token-logo').map((logo) => logo.getAttribute('data-size'))).toEqual(['42', '42'])
    expect(screen.getByText('Sell amount')).not.toBeNull()
    expect(document.querySelector('#input-currency-preview .token-amount-input')?.getAttribute('title')).toBe(
      `${expectedSellAmount.toExact()} ${order.inputToken.symbol}`,
    )
    const limitPriceRow = screen.getByText('Limit price').parentElement?.parentElement
    const limitPriceValue = limitPriceRow?.lastElementChild
    expect(limitPriceValue && getComputedStyle(limitPriceValue).alignItems).toBe('flex-end')
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByText('Order surplus')).not.toBeNull()
    expect(screen.getByRole('button', { name: /Fees & costs/ }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByRole('button', { name: /Order metadata/ }).getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(screen.getByRole('button', { name: 'Recreate this order' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss overlay' }))
    fireEvent.click(within(header).getByRole('button', { name: 'Close order receipt' }))

    expect(showAlternativeOrderModal).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledTimes(2)
  })

  it('uses buy-order semantics and hides invented fill data for an unfilled open order', () => {
    const baseOrder = getOrder()
    const order = getOrder({
      kind: OrderKind.BUY,
      status: OrderStatus.PENDING,
      executionData: {
        ...baseOrder.executionData,
        filledAmount: new BigNumber(0),
        filledPercentage: new BigNumber(0),
        filledPercentDisplay: '0',
        fullyFilled: false,
        partiallyFilled: false,
        surplusAmount: new BigNumber(0),
        surplusPercentage: new BigNumber(0),
      },
    })
    const estimatedExecutionPrice = buildPriceFromCurrencyAmounts(
      CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
      CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount),
    )

    renderReceipt({ order, estimatedExecutionPrice })

    expect(screen.getByText('Sell at most')).not.toBeNull()
    expect(screen.getByText('Receive exactly')).not.toBeNull()
    expect(screen.getByText('Executes at')).not.toBeNull()
    expect(screen.queryByText('Order surplus')).toBeNull()
    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('uses actual average execution data for a partially filled open order and exposes its actions', () => {
    const baseOrder = getOrder()
    const onDismiss = jest.fn()
    const showCancellationModal = jest.fn()
    const actualExecutionPrice = buildPriceFromCurrencyAmounts(
      CurrencyAmount.fromRawAmount(baseOrder.inputToken, baseOrder.sellAmount),
      CurrencyAmount.fromRawAmount(baseOrder.outputToken, baseOrder.buyAmount),
    )
    const order = getOrder({
      status: OrderStatus.PENDING,
      partiallyFillable: true,
      executionData: {
        ...baseOrder.executionData,
        executedPrice: actualExecutionPrice,
        filledAmount: new BigNumber(baseOrder.sellAmount).dividedBy(2),
        filledPercentage: new BigNumber(0.5),
        filledPercentDisplay: '50',
        fullyFilled: false,
        partiallyFilled: true,
      },
    })
    const estimatedExecutionPrice = buildPriceFromCurrencyAmounts(
      CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
      CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount),
    )

    renderReceipt({ order, estimatedExecutionPrice, onDismiss, showCancellationModal })

    expect(screen.getByText('Avg. execution')).not.toBeNull()
    expect(screen.queryByText('Executes at')).toBeNull()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')

    fireEvent.click(screen.getByRole('button', { name: 'Order actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel order' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(showCancellationModal).toHaveBeenCalledTimes(1)
  })

  it.each([OrderStatus.CANCELLED, OrderStatus.EXPIRED, OrderStatus.FAILED])(
    'shows a clear not-filled result for terminal %s orders',
    (status) => {
      const baseOrder = getOrder()
      const order = getOrder({
        status,
        executionData: {
          ...baseOrder.executionData,
          executedPrice: null,
          filledAmount: new BigNumber(0),
          filledPercentage: new BigNumber(0),
          filledPercentDisplay: '0',
          fullyFilled: false,
          partiallyFilled: false,
          surplusAmount: new BigNumber(0),
          surplusPercentage: new BigNumber(0),
        },
      })

      renderReceipt({ order })

      expect(screen.getByText('Not filled')).not.toBeNull()
      expect(screen.queryByRole('progressbar')).toBeNull()
      expect(screen.queryByText('Execution price')).toBeNull()
      expect(screen.queryByText('Avg. execution')).toBeNull()
      expect(screen.queryByRole('button', { name: 'Order actions' })).toBeNull()
    },
  )

  it('formats the creation age compactly', () => {
    const now = new Date('2026-08-19T12:00:00.000Z')
    const nineMonthsInSeconds = 9 * 2_629_800
    const creationTime = new Date(now.getTime() - nineMonthsInSeconds * 1_000)

    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    renderReceipt({ order: getOrder({ creationTime }) })

    expect(screen.getByText('Created 9 mo ago')).not.toBeNull()
  })

  it('preserves the TWAP parent and part field distinction, including Safe metadata', () => {
    const order = getOrder({ partiallyFillable: true })
    const twapOrder = {
      order: { n: 3 },
      resolvedOwner: order.owner,
      safeAddress: order.owner,
      safeTxParams: {
        safeTxHash: '0x1234567890abcdef',
        nonce: '7',
        confirmations: 1,
        confirmationsRequired: 2,
      },
    } as unknown as TwapOrderItem

    const parent = renderReceipt({ order, twapOrder })

    expect(screen.getByText('TWAP order split into 3 parts')).not.toBeNull()
    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByText('Order surplus')).toBeNull()
    expect(screen.queryByText('Avg. execution')).toBeNull()
    expect(screen.queryByRole('button', { name: /Fees & costs/ })).toBeNull()

    parent.unmount()
    renderReceipt({ order, twapOrder, isTwapPartOrder: true })

    expect(screen.getByText('Part of a 3-part TWAP order split')).not.toBeNull()
    expect(screen.getByText('Avg. execution')).not.toBeNull()
    expect(screen.getByRole('button', { name: /Fees & costs/ })).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Order metadata/ }))

    expect(screen.getByText('Safe transaction')).not.toBeNull()
    expect(screen.getByText('Safe nonce')).not.toBeNull()
    expect(screen.getByText('Safe confirmed signatures')).not.toBeNull()
  })

  it('does not present emulated execution data for virtual TWAP parts', () => {
    const order = getOrder({
      composableCowInfo: { isVirtualPart: true },
      executionData: {
        ...getBaseOrder().executionData,
        activityId: '0x1234567890abcdef',
        activityTitle: 'Transaction',
      },
    })
    const twapOrder = {
      order: { n: 3 },
      resolvedOwner: order.owner,
    } as unknown as TwapOrderItem

    renderReceipt({ order, twapOrder, isTwapPartOrder: true })

    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByText('Order surplus')).toBeNull()
    expect(screen.queryByText('Avg. execution')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Order metadata/ }))

    expect(screen.queryByText('Transaction')).toBeNull()
  })
})
