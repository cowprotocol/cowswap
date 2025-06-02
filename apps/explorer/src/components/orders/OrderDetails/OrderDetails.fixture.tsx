import React from 'react'

import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { add, sub } from 'date-fns'

import { Order, Trade } from '../../../api/operator'
import { GlobalStateContext } from '../../../hooks/useGlobalState'
import { RICH_ORDER } from '../../../test/data' // Moved before types
import { Errors, Network } from '../../../types'
import { BridgeDetails, BridgeStatus } from '../../../types/bridge' // Added bridge types

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

// --- Mock Bridge Details ---
const mockSourceToken: TokenInfo = {
  address: usdtToken.address,
  chainId: SupportedChainId.MAINNET,
  symbol: usdtToken.symbol || 'USDT',
  decimals: usdtToken.decimals,
  name: usdtToken.name || 'Tether USD',
}

const mockDestinationToken: TokenInfo = {
  address: '0xanotherMainnetTokenForBridgeFixture', // Example different token on Mainnet
  chainId: SupportedChainId.MAINNET, // Using MAINNET again to avoid linter issues
  symbol: 'USDT.bridged', // Example symbol for bridged USDT on Mainnet for fixture
  decimals: 6,
  name: 'Bridged USDT',
}

const pendingBridgeDetails: BridgeDetails = {
  providerName: 'TestBridgeProvider',
  isSuccess: false,
  status: BridgeStatus.Pending,
  bridgeQuoteTimestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  expectedFillTimeSeconds: 600, // 10 minutes
  source: mockSourceToken,
  destination: mockDestinationToken,
  inputAmount: '2000000000', // 2000 USDT (matching sellAmount)
  // outputAmount initially undefined for pending
  gasCostsNative: '10000000000000000', // 0.01 ETH on source chain (example)
  protocolFeeSellToken: '1000000', // 1 USDT
  maxSlippageBps: 50, // 0.5%
  sourceChainTransactionHash: '0xsourceTxHashForPendingBridgeOrderDetailsFixture',
  // destinationChainTransactionHash initially undefined
  explorerUrl: 'https://testbridgeprovider.example.com/tx/0xsourceTxHashForPendingBridgeOrderDetailsFixture',
}

const completedBridgeDetails: BridgeDetails = {
  ...pendingBridgeDetails,
  isSuccess: true,
  status: BridgeStatus.Completed,
  outputAmount: '1998000000', // 1998 USDT.bridged (after fees, example)
  destinationChainTransactionHash: '0xdestinationTxHashForCompletedBridgeOrderDetailsFixture',
  explorerUrl: 'https://testbridgeprovider.example.com/tx/0xdestinationTxHashForCompletedBridgeOrderDetailsFixture', // URL might update or stay same based on provider
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
    status: 'open' as const,
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
    status: 'filled' as const,
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
}

const openOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusOpen,
} as Order

const filledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled,
} as Order

// --- New Swap + Bridge Mock Orders ---
const swapBridgeOpenOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusOpen, // Swap part is open
  bridgeDetails: pendingBridgeDetails as any, // Bridge part is pending
} as Order

const swapBridgeFilledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: completedBridgeDetails as any, // Bridge part is completed
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

const mockGlobalStateContextValue: [any, React.Dispatch<any>] = [{ networkId: Network.MAINNET }, () => {}]

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
}
