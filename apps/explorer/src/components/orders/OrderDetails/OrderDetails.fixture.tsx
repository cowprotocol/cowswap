import React from 'react'

import {
  BridgeDetails,
  BridgeStatus,
  BridgeableToken,
  BridgeProvider,
  BRIDGE_PROVIDER_DETAILS,
} from '@cowprotocol/bridge'
import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { add, sub } from 'date-fns'

import { Order, Trade } from '../../../api/operator'
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

const daiMainnetToken: BridgeableToken = {
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI on Mainnet
  chainId: SupportedChainId.MAINNET,
  symbol: 'DAI',
  decimals: 18,
}

const daiGnosisChainToken: BridgeableToken = {
  address: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
  chainId: SupportedChainId.GNOSIS_CHAIN,
  symbol: 'DAI.gc',
  decimals: 18,
}

const bungeeBridgeInfo = BRIDGE_PROVIDER_DETAILS[BridgeProvider.BUNGEE]

const pendingBridgeDetails: BridgeDetails = {
  providerName: bungeeBridgeInfo.title,
  providerUrl: bungeeBridgeInfo.url,
  isSuccess: false,
  status: BridgeStatus.Pending,
  bridgeQuoteTimestamp: Date.now() - 1000 * 60 * 10,
  expectedFillTimeSeconds: 26 * 60,
  source: daiMainnetToken,
  destination: daiGnosisChainToken,
  inputAmount: '100000000000000000000',
  outputAmount: undefined,
  gasCostsNative: '5000000000000000',
  protocolFeeSellToken: '100000000000000000',
  maxSlippageBps: 50,
  sourceChainTransactionHash: '0x2f82b4b0c6a5b3e0a9d7c5f8e1a9007a71e02baf43f081a4ea87c494e2b16073',
  explorerUrl: bungeeBridgeInfo.url + '/explorer/0x2f82b4b0c6a5b3e0a9d7c5f8e1a9007a71e02baf43f081a4ea87c494e2b16073',
  minDepositAmount: '1000000000000000000',
  maxDepositAmount: '100000000000000000000000',
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

// Additional swap+bridge scenarios
const swapBridgeInProgressOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: {
    ...pendingBridgeDetails,
    status: BridgeStatus.InProgress,
    sourceChainTransactionHash: '0x2f82b4b0c6a5b3e0a9d7c5f8e1a9007a71e02baf43f081a4ea87c494e2b16073',
  },
} as Order

const swapBridgeFailedOrder: Order = {
  ...baseMockOrderData,
  ...baseMockOrderData.statusFilled, // Swap part is filled
  bridgeDetails: {
    ...pendingBridgeDetails,
    status: BridgeStatus.Failed,
    isSuccess: false,
    errorMessage: 'Bridge operation failed due to insufficient liquidity',
  },
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
  'Swap+Bridge - (Swap Filled, Bridge Failed)': () => (
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
  'Swap+Bridge - (Swap Partially Filled)': () => (
    <WithProviders>
      <OrderDetails
        order={swapBridgePartiallyFilledOrder}
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
