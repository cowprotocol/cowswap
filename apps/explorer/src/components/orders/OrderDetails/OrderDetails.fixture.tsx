import React from 'react'

import { BridgeDetails, BridgeStatus } from '@cowprotocol/bridge'
import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { add, sub } from 'date-fns'

import { Order, Trade } from '../../../api/operator'
import { GlobalStateContext } from '../../../hooks/useGlobalState'
import { RICH_ORDER } from '../../../test/data'
import { Errors, Network } from '../../../types'
import { BridgeDetailsTable } from '../BridgeDetailsTable'
import { BridgeProvider, MOCK_BRIDGE_PROVIDER_DETAILS } from '../BridgeDetailsTable/mockBridgeProviders'

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

const bungeeBridgeInfo = MOCK_BRIDGE_PROVIDER_DETAILS[BridgeProvider.BUNGEE]

const pendingBridgeDetails: BridgeDetails = {
  providerName: bungeeBridgeInfo.title,
  providerUrl: bungeeBridgeInfo.url,
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
  outputAmount: '99800000000000000000',
  sourceChainTransactionHash: '0x2f82b4b0c6a5b3e0a9d7c5f8e1a9007a71e02baf43f081a4ea87c494e2b16073',
  destinationChainTransactionHash: '0x9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
  explorerUrl: bungeeBridgeInfo.url + '/explorer/0x9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
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
  bridgeDetails: pendingBridgeDetails, // Bridge part is pending (ensure this uses the updated pendingBridgeDetails)
} as Order

const swapBridgeFilledOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: completedBridgeDetails, // Bridge part is completed (ensure this uses the updated completedBridgeDetails)
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
  // --- Standalone BridgeDetailsTable Stories ---
  'BridgeDetailsTable - Pending': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Pending State)</h2>
        <BridgeDetailsTable
          bridgeDetails={pendingBridgeDetails}
          ownerAddress="0xOwnerPending1234567890abcdef1234567890"
          receiverAddress="0xReceiverPending0987654321fedcba098765"
        />
      </div>
    </WithProviders>
  ),
  'BridgeDetailsTable - Completed': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Completed State)</h2>
        <BridgeDetailsTable
          bridgeDetails={completedBridgeDetails}
          ownerAddress="0xOwnerCompleted1234567890abcdef1234567890"
          receiverAddress="0xReceiverCompleted0987654321fedcba098765"
        />
      </div>
    </WithProviders>
  ),
  'BridgeDetailsTable - Loading': () => (
    <WithProviders>
      <div style={{ padding: '1rem' }}>
        <h2>Bridge Details Table (Loading State)</h2>
        <BridgeDetailsTable
          isLoading={true}
          ownerAddress="0xOwnerLoading1234567890abcdef1234567890"
          receiverAddress="0xReceiverLoading0987654321fedcba098765"
        />
      </div>
    </WithProviders>
  ),
}
