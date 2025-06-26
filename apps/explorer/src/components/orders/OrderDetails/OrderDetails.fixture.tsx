import React from 'react'

import { BridgeStatus, CrossChainOrder, OrderClass, OrderKind } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { add, sub } from 'date-fns'

import { crossChainOrderMock } from './crossChainOrder.mock'

import { Order, OrderStatus, Trade } from '../../../api/operator'
import { GlobalStateContext } from '../../../hooks/useGlobalState'
import { RICH_ORDER } from '../../../test/data'
import { Errors, Network } from '../../../types'
import { BridgeDetailsTable } from '../BridgeDetailsTable'

import { OrderDetails } from '.'

const wethToken: TokenErc20 = {
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  symbol: 'WETH',
  name: 'Wrapped Ether',
  decimals: 18,
}

const usdtToken: TokenErc20 = {
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
}

const pendingBridgeDetails: CrossChainOrder = {
  ...crossChainOrderMock,
  statusResult: {
    ...crossChainOrderMock.statusResult,
    status: BridgeStatus.IN_PROGRESS,
  },
}

const completedBridgeDetails: CrossChainOrder = {
  ...pendingBridgeDetails,
  statusResult: {
    ...crossChainOrderMock.statusResult,
    status: BridgeStatus.EXECUTED,
  },
}

// NEW: Additional bridge details for missing BridgeStatus scenarios
const refundingBridgeDetails: CrossChainOrder = {
  ...pendingBridgeDetails,
  statusResult: {
    ...crossChainOrderMock.statusResult,
    status: BridgeStatus.IN_PROGRESS,
  },
}

const refundCompleteBridgeDetails: CrossChainOrder = {
  ...pendingBridgeDetails,
  statusResult: {
    ...crossChainOrderMock.statusResult,
    status: BridgeStatus.REFUND,
  },
}

const unknownBridgeDetails: CrossChainOrder = {
  ...pendingBridgeDetails,
  statusResult: {
    ...crossChainOrderMock.statusResult,
    status: BridgeStatus.UNKNOWN,
  },
}

// Base Mock Order Data - aligned with apps/explorer/src/api/operator/types.ts Order type
const baseMockOrderData = {
  uid: '0x1234567890abcdef1234567890abcdef1234567890abcdef12345678',
  owner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  receiver: '0xAbbA307F332117D775531e80A21ea605C46712d1',
  appData: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  fullAppData: JSON.stringify({ metadata: { orderClass: { orderClass: 'market' } } }),
  signature: '0xsignature',
  class: OrderClass.MARKET,
  partiallyFillable: false,
  creationDate: sub(new Date(), { hours: 1 }),
  expirationDate: add(new Date(), { hours: 24 }),
  buyTokenAddress: wethToken.address,
  sellTokenAddress: usdtToken.address,
  buyAmount: new BigNumber('1000000000000000000'), // 1 WETH
  sellAmount: new BigNumber('2000000000'), // 2000 USDT
  feeAmount: new BigNumber('1000000000000000'), // 0.001 ETH as potential total fee for the order
  cancelled: false,
  // Fields for open state
  statusOpen: {
    kind: OrderKind.SELL,
    status: OrderStatus.Open,
    txHash: undefined,
    executionDate: undefined,
    buyToken: wethToken,
    sellToken: usdtToken,
    executedBuyAmount: new BigNumber('0'),
    executedSellAmount: new BigNumber('0'),
    executedFeeAmount: new BigNumber('0'),
    executedFee: new BigNumber('0'), // Can be null, using 0 for simplicity
    totalFee: new BigNumber('0'),
    executedFeeToken: usdtToken.address, // Address of the token fee is paid in
    partiallyFilled: false,
    fullyFilled: false,
    filledAmount: new BigNumber('0'),
    filledPercentage: new BigNumber('0'),
    surplusAmount: new BigNumber('0'),
    surplusPercentage: new BigNumber('0'),
  },
  // Fields for filled state
  statusFilled: {
    kind: OrderKind.SELL,
    status: OrderStatus.Filled,
    txHash: '0xfilltxhash0123456789abcdef0123456789abcdef0123456789abcdef',
    executionDate: new Date(),
    buyToken: wethToken,
    sellToken: usdtToken,
    executedBuyAmount: new BigNumber('1000000000000000000'), // Full amount bought
    executedSellAmount: new BigNumber('2000000000'), // Full amount sold
    executedFeeAmount: new BigNumber('1000000000000000'), // Full fee amount
    executedFee: new BigNumber('1000000000000000'),
    totalFee: new BigNumber('1000000000000000'), // Total fee for the order is the full feeAmount
    executedFeeToken: usdtToken.address,
    partiallyFilled: false,
    fullyFilled: true,
    filledAmount: new BigNumber('2000000000'), // Total sell amount filled
    filledPercentage: new BigNumber('1'),
    surplusAmount: new BigNumber('100000000'), // e.g., 100 USDT surplus
    surplusPercentage: new BigNumber('0.05'), // 5% surplus
  },
  // Fields for signing state
  statusSigning: {
    kind: OrderKind.SELL,
    status: OrderStatus.Signing,
    txHash: undefined,
    executionDate: undefined,
    buyToken: wethToken,
    sellToken: usdtToken,
    executedBuyAmount: new BigNumber('0'),
    executedSellAmount: new BigNumber('0'),
    executedFeeAmount: new BigNumber('0'),
    executedFee: new BigNumber('0'),
    totalFee: new BigNumber('0'),
    executedFeeToken: usdtToken.address,
    partiallyFilled: false,
    fullyFilled: false,
    filledAmount: new BigNumber('0'),
    filledPercentage: new BigNumber('0'),
    surplusAmount: new BigNumber('0'),
    surplusPercentage: new BigNumber('0'),
  },
  // Fields for cancelled state
  statusCancelled: {
    kind: OrderKind.SELL,
    status: OrderStatus.Cancelled,
    txHash: undefined,
    executionDate: undefined,
    buyToken: wethToken,
    sellToken: usdtToken,
    executedBuyAmount: new BigNumber('0'),
    executedSellAmount: new BigNumber('0'),
    executedFeeAmount: new BigNumber('0'),
    executedFee: new BigNumber('0'),
    totalFee: new BigNumber('0'),
    executedFeeToken: usdtToken.address,
    partiallyFilled: false,
    fullyFilled: false,
    filledAmount: new BigNumber('0'),
    filledPercentage: new BigNumber('0'),
    surplusAmount: new BigNumber('0'),
    surplusPercentage: new BigNumber('0'),
    cancelled: true,
  },
  // Fields for cancelling state
  statusCancelling: {
    kind: OrderKind.SELL,
    status: OrderStatus.Cancelling,
    txHash: undefined,
    executionDate: undefined,
    buyToken: wethToken,
    sellToken: usdtToken,
    executedBuyAmount: new BigNumber('0'),
    executedSellAmount: new BigNumber('0'),
    executedFeeAmount: new BigNumber('0'),
    executedFee: new BigNumber('0'),
    totalFee: new BigNumber('0'),
    executedFeeToken: usdtToken.address,
    partiallyFilled: false,
    fullyFilled: false,
    filledAmount: new BigNumber('0'),
    filledPercentage: new BigNumber('0'),
    surplusAmount: new BigNumber('0'),
    surplusPercentage: new BigNumber('0'),
  },
  // Fields for expired state
  statusExpired: {
    kind: OrderKind.SELL,
    status: OrderStatus.Expired,
    txHash: undefined,
    executionDate: undefined,
    buyToken: wethToken,
    sellToken: usdtToken,
    executedBuyAmount: new BigNumber('0'),
    executedSellAmount: new BigNumber('0'),
    executedFeeAmount: new BigNumber('0'),
    executedFee: new BigNumber('0'),
    totalFee: new BigNumber('0'),
    executedFeeToken: usdtToken.address,
    partiallyFilled: false,
    fullyFilled: false,
    filledAmount: new BigNumber('0'),
    filledPercentage: new BigNumber('0'),
    surplusAmount: new BigNumber('0'),
    surplusPercentage: new BigNumber('0'),
    expirationDate: sub(new Date(), { hours: 1 }), // Already expired
  },
  // Fields for partially filled state
  statusPartiallyFilled: {
    kind: OrderKind.SELL,
    status: OrderStatus.Open, // Still open but partially filled
    txHash: undefined,
    executionDate: undefined,
    buyToken: wethToken,
    sellToken: usdtToken,
    executedBuyAmount: new BigNumber('500000000000000000'), // 0.5 WETH executed
    executedSellAmount: new BigNumber('1000000000'), // 1000 USDT executed
    executedFeeAmount: new BigNumber('500000000000000'), // Half fee amount
    executedFee: new BigNumber('500000000000000'),
    totalFee: new BigNumber('1000000000000000'),
    executedFeeToken: usdtToken.address,
    partiallyFilled: true,
    fullyFilled: false,
    filledAmount: new BigNumber('1000000000'), // Sell amount filled
    filledPercentage: new BigNumber('0.5'), // 50% filled
    surplusAmount: new BigNumber('50000000'), // 50 USDT surplus
    surplusPercentage: new BigNumber('0.05'), // 5% surplus
    partiallyFillable: true,
  },
}

const openOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusOpen,
} as Order

const filledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled,
} as Order

// NEW: Missing regular order status scenarios
const signingOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusSigning,
} as Order

const cancelledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusCancelled,
} as Order

const cancellingOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusCancelling,
} as Order

const expiredOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusExpired,
} as Order

const partiallyFilledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusPartiallyFilled,
} as Order

// --- New Swap + Bridge Mock Orders ---
const swapBridgeOpenOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusOpen, // Swap part is open
  bridgeDetails: pendingBridgeDetails, // Bridge part is pending (ensure this uses the updated pendingBridgeDetails)
} as Order

// NEW: Signing + Bridge scenarios
const swapBridgeSigningOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusSigning, // Swap part needs signature
  bridgeDetails: pendingBridgeDetails, // Bridge part is pending
} as Order

// NEW: Cancelled/Expired + Bridge scenarios
const swapBridgeCancelledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusCancelled, // Swap part was cancelled
} as Order

const swapBridgeExpiredOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusExpired, // Swap part expired
} as Order

const swapBridgeFilledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: completedBridgeDetails, // Bridge part is completed (ensure this uses the updated completedBridgeDetails)
} as Order

// Additional swap+bridge scenarios
const swapBridgeInProgressOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
} as Order

const swapBridgeFailedOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
} as Order

// NEW: Missing bridge status scenarios
const swapBridgeRefundingOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: refundingBridgeDetails,
} as Order

const swapBridgeRefundCompleteOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: refundCompleteBridgeDetails,
} as Order

const swapBridgeUnknownOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: unknownBridgeDetails,
} as Order

const swapBridgeFailedRefundFailedOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled,
} as Order

const swapBridgePartiallyFilledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusOpen,
  partiallyFillable: true,
  partiallyFilled: true,
  executedBuyAmount: new BigNumber('500000000000000000'), // 0.5 WETH executed
  executedSellAmount: new BigNumber('1000000000'), // 1000 USDT executed
  filledAmount: new BigNumber('1000000000'),
  filledPercentage: new BigNumber('0.5'),
  bridgeDetails: pendingBridgeDetails,
} as Order

const mockTradeExecutedFee = filledOrder.totalFee // totalFee from Order is BigNumber

const mockTradesFilledOrder: Trade[] = [
  {
    blockNumber: 15000000,
    logIndex: 0,
    owner: filledOrder.owner,
    txHash: filledOrder.txHash as string, // txHash is optional in Order, but required for Trade in this context
    orderId: filledOrder.uid,
    kind: filledOrder.kind,
    buyAmount: filledOrder.executedBuyAmount,
    sellAmount: filledOrder.executedSellAmount, // This is sell amount *after* fees for the trade
    executedFee: mockTradeExecutedFee, // Fee for this specific trade
    sellAmountBeforeFees: filledOrder.executedSellAmount.plus(mockTradeExecutedFee), // Calculated before fee
    buyToken: filledOrder.buyToken,
    buyTokenAddress: filledOrder.buyTokenAddress,
    sellToken: filledOrder.sellToken,
    sellTokenAddress: filledOrder.sellTokenAddress,
    executionTime: filledOrder.executionDate as Date, // executionDate is optional in Order, ensure it's a Date here
    surplusAmount: filledOrder.surplusAmount, // Optional in Trade, passing from order
    surplusPercentage: filledOrder.surplusPercentage, // Optional in Trade, passing from order
  },
]

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGlobalStateContextValue: [any, React.Dispatch<any>] = [{ networkId: Network.MAINNET }, () => {}]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const WithProviders = ({ children }: { children: React.ReactNode }) => (
  <GlobalStateContext.Provider value={mockGlobalStateContextValue}>{children}</GlobalStateContext.Provider>
)

// --- Fixture Definitions ---
const noErrors: Errors = {}
const defaultTrades: Trade[] = []

export default {
  'Open Order': () => (
    <WithProviders>
      <OrderDetails
        order={openOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Filled Order': () => (
    <WithProviders>
      <OrderDetails
        order={filledOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),

  // NEW: Regular order status scenarios
  'Signing Order (Pending Signature)': () => (
    <WithProviders>
      <OrderDetails
        order={signingOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Cancelled Order': () => (
    <WithProviders>
      <OrderDetails
        order={cancelledOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Cancelling Order': () => (
    <WithProviders>
      <OrderDetails
        order={cancellingOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Expired Order': () => (
    <WithProviders>
      <OrderDetails
        order={expiredOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Partially Filled Order': () => (
    <WithProviders>
      <OrderDetails
        order={partiallyFilledOrder}
        trades={[
          {
            ...mockTradesFilledOrder[0],
            buyAmount: new BigNumber('500000000000000000'), // 0.5 WETH
            sellAmount: new BigNumber('1000000000'), // 1000 USDT
          },
        ]}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),

  'Order Found (RICH_ORDER)': () => (
    <WithProviders>
      <OrderDetails
        order={RICH_ORDER}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Order Loading': () => (
    <WithProviders>
      <OrderDetails
        order={null}
        trades={defaultTrades}
        isOrderLoading={true}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Trades Loading (RICH_ORDER)': () => (
    <WithProviders>
      <OrderDetails
        order={RICH_ORDER}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={true}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Order Not Found': () => (
    <WithProviders>
      <OrderDetails
        order={null}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Tokens Not Loaded (RICH_ORDER)': () => (
    <WithProviders>
      <OrderDetails
        order={{ ...RICH_ORDER, buyToken: null, sellToken: null }}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'With Errors': () => (
    <WithProviders>
      <OrderDetails
        order={null}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={{
          error1: { message: 'Failed something something', type: 'error' },
          error2: { message: 'Something else failed', type: 'error' },
        }}
      />
    </WithProviders>
  ),
  // --- New Swap + Bridge Fixtures ---
  'Swap+Bridge - (Swap Open, Bridge Pending)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeOpenOrder}
        trades={defaultTrades} // No swap trades yet if swap is just 'open'
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  // NEW: Additional swap+bridge edge cases
  'Swap+Bridge - (Swap Signing, Bridge Pending)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeSigningOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Cancelled, Bridge Failed)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeCancelledOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Expired, Bridge Failed)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeExpiredOrder}
        trades={defaultTrades}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Filled, Bridge Complete)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeFilledOrder}
        trades={mockTradesFilledOrder} // Swap part has trades
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Filled, Bridge In Progress)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeInProgressOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Filled, Bridge Failed - Refund Not Initiated)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeFailedOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  // NEW: Missing bridge status scenarios
  'Swap+Bridge - (Swap Filled, Bridge Failed - Refunding)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeRefundingOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Filled, Bridge Failed - Refund Completed)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeRefundCompleteOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Filled, Bridge Unknown)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeUnknownOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Filled, Bridge Failed - Refund Failed)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgeFailedRefundFailedOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  'Swap+Bridge - (Swap Partially Filled)': () => (
    <WithProviders>
      {/* NOTE: Partial fills + bridge is not currently supported, but fixture included for future testing */}
      <OrderDetails
        order={swapBridgePartiallyFilledOrder}
        trades={mockTradesFilledOrder}
        isOrderLoading={false}
        areTradesLoading={false}
        errors={noErrors}
      />
    </WithProviders>
  ),
  // --- Standalone BridgeDetailsTable Stories ---
  'BridgeDetailsTable - Pending': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Pending State)</h2>
        <BridgeDetailsTable crossChainOrder={pendingBridgeDetails} />
      </div>
    </WithProviders>
  ),
  'BridgeDetailsTable - Completed': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Completed State)</h2>
        <BridgeDetailsTable crossChainOrder={completedBridgeDetails} />
      </div>
    </WithProviders>
  ),
  'BridgeDetailsTable - Loading': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Loading State)</h2>
        <BridgeDetailsTable isLoading={true} crossChainOrder={undefined} />
      </div>
    </WithProviders>
  ),
  // NEW: Missing bridge status scenarios
  'BridgeDetailsTable - Failed (Refunding)': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Failed - Refunding)</h2>
        <BridgeDetailsTable crossChainOrder={refundingBridgeDetails} />
      </div>
    </WithProviders>
  ),
  'BridgeDetailsTable - Failed (Refund Completed)': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Failed - Refund Completed)</h2>
        <BridgeDetailsTable crossChainOrder={refundCompleteBridgeDetails} />
      </div>
    </WithProviders>
  ),
  'BridgeDetailsTable - Unknown Status': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Unknown Status)</h2>
        <BridgeDetailsTable crossChainOrder={unknownBridgeDetails} />
      </div>
    </WithProviders>
  ),
}
