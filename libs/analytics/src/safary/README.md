# Safary Analytics Integration

This module provides tracking capabilities for Safary marketing analytics in CoW Protocol applications.

## Overview

The Safary Analytics integration tracks user actions and connects marketing clicks with on-chain user actions for attribution.

Events tracked:

- **page_view**: When a user lands on a page with UTM parameters
- **wallet_connected**: When a user connects their wallet
- **token_selected**: When a user selects tokens for trading
- **order_submitted**: When a user submits an order
- **order_executed**: When a trade is successfully completed
- **order_failed**: When a trade fails

## Trade Types

Safary analytics supports different types of trades with consistent naming conventions:

```typescript
export enum SafaryTradeType {
  SWAP_ORDER = 'swap', // Regular swap
  LIMIT_ORDER = 'limit_order', // Limit order
  TWAP_ORDER = 'twap_order', // TWAP order
}
```

## Components

### 1. Basic Components

- **BasicTradeFlowTrackingUpdater**: A simplified tracker that only handles page views and wallet connections, without requiring order data

  ```tsx
  import { BasicTradeFlowTrackingUpdater } from '@cowprotocol/analytics'

  // In your component
  return (
    <>
      <BasicTradeFlowTrackingUpdater account={account} pageView="swap_page_view" />
      {/* ...rest of your component */}
    </>
  )
  ```

### 2. Advanced Components

- **TradeFlowTrackingUpdater**: A comprehensive tracker for complete trade flows that combines page views, wallet connections, and order tracking

  ```tsx
  import { TradeFlowTrackingUpdater, SafaryTradeType } from '@cowprotocol/analytics'

  // In your component
  return (
    <>
      <TradeFlowTrackingUpdater
        account={account}
        pageView="swap_page_view"
        orderType="SWAP"
        tradeType={SafaryTradeType.SWAP_ORDER}
        ordersById={ordersById}
        activityItems={activityItems}
        statusConstants={{
          activityTypeName: 'order',
          fulfilledStatus: 'fulfilled',
          failedStatus: 'failed',
          orderFulfilledStatus: 'fulfilled',
          orderFailedStatus: 'failed',
        }}
      />
      {/* ...rest of your component */}
    </>
  )
  ```

### 3. Hooks

- **useSafaryAnalytics**: Hook for using Safary analytics in components

  ```tsx
  import { useSafaryAnalytics, SafaryTradeType } from '@cowprotocol/analytics'

  function MyComponent() {
    const {
      trackPageView,
      trackWalletConnected,
      trackTokenSelected,
      trackOrderSubmitted,
      trackOrderExecuted,
      trackOrderFailed,
    } = useSafaryAnalytics()

    // Example: Track order submission
    trackOrderSubmitted(account, SafaryTradeType.SWAP_ORDER, {
      fromCurrency: 'ETH',
      toCurrency: 'USDC',
      fromAmount: 1.0,
      toAmount: 1800,
    })
  }
  ```

- **useSafaryTradeTracking**: Hook for enhancing trade functions with analytics tracking

  ```tsx
  import { useSafaryTradeTracking, SafaryTradeType } from '@cowprotocol/analytics'

  function TradeComponent() {
    // Original trade function
    const originalDoTrade = async () => {
      // Execute trade logic
    }

    // Enhanced trade function with tracking
    const doTrade = useSafaryTradeTracking({
      account,
      inputCurrencyInfo: {
        symbol: inputCurrency?.symbol,
        amount: inputAmount,
        fiatAmount: inputAmountUsd,
      },
      outputCurrencyInfo: {
        symbol: outputCurrency?.symbol,
        amount: outputAmount,
        fiatAmount: outputAmountUsd,
      },
      tradeFn: originalDoTrade,
      contractAddress: inputCurrency?.address || '',
      tradeType: SafaryTradeType.SWAP_ORDER,
    })

    // Use doTrade instead of originalDoTrade in your component
  }
  ```

## Usage in Different Order Types

The tracking components are designed to be generic and work with different order types:

### Basic Tracking (Page Views & Wallet Connections Only)

Use the BasicTradeFlowTrackingUpdater for any order type:

```tsx
// For Swap Orders
<BasicTradeFlowTrackingUpdater
  account={account}
  pageView="swap_page_view"
  label="swap"
/>

// For Limit Orders
<BasicTradeFlowTrackingUpdater
  account={account}
  pageView="limit_order_page_view"
  label="limit order"
/>

// For TWAP Orders
<BasicTradeFlowTrackingUpdater
  account={account}
  pageView="twap_page_view"
  label="TWAP order"
/>
```

### Full Tracking (Including Order Execution & Failures)

1. **Swap Orders**:

   ```tsx
   <TradeFlowTrackingUpdater
     account={account}
     pageView="swap_page_view"
     orderType="SWAP"
     tradeType={SafaryTradeType.SWAP_ORDER}
     // ... other props
     label="swap"
   />
   ```

2. **Limit Orders**:

   ```tsx
   <TradeFlowTrackingUpdater
     account={account}
     pageView="limit_order_page_view"
     orderType="LIMIT"
     tradeType={SafaryTradeType.LIMIT_ORDER}
     // ... other props
     label="limit order"
   />
   ```

3. **TWAP Orders**:
   ```tsx
   <TradeFlowTrackingUpdater
     account={account}
     pageView="twap_page_view"
     orderType="TWAP"
     tradeType={SafaryTradeType.TWAP_ORDER}
     // ... other props
     label="TWAP order"
   />
   ```

## Integration Steps

### Step 1: Basic Tracking

Start with the BasicTradeFlowTrackingUpdater which only requires account and pageView:

```tsx
import { BasicTradeFlowTrackingUpdater } from '@cowprotocol/analytics'

function YourComponent() {
  const { account } = useWalletInfo()

  return (
    <>
      <BasicTradeFlowTrackingUpdater account={account} pageView="your_page_view" label="your order type" />
      {/* ...your component */}
    </>
  )
}
```

### Step 2: Full Tracking

When you're ready to track order execution and failures, upgrade to TradeFlowTrackingUpdater:

1. **Import the analytics components**:

   ```tsx
   import { TradeFlowTrackingUpdater, useSafaryTradeTracking, SafaryTradeType } from '@cowprotocol/analytics'
   ```

2. **Gather order data**:

   ```tsx
   // Get activity items and orders from your application
   const orders = useYourOrdersHook()
   const activityItems = useYourActivityItemsHook()

   // Create a record of orders by ID
   const ordersById = orders.reduce((acc: Record<string, any>, order: any) => {
     acc[order.id] = order
     return acc
   }, {})
   ```

3. **Add TradeFlowTrackingUpdater to your component**:

   ```tsx
   <TradeFlowTrackingUpdater
     account={account}
     pageView="your_page_view"
     orderType="YOUR_ORDER_TYPE" // Your application's order type
     tradeType={SafaryTradeType.SWAP_ORDER} // Safary's trade type
     ordersById={ordersById}
     activityItems={activityItems}
     statusConstants={{
       activityTypeName: 'order',
       fulfilledStatus: 'fulfilled',
       failedStatus: 'failed',
       orderFulfilledStatus: 'fulfilled',
       orderFailedStatus: 'failed',
     }}
     label="your order type"
   />
   ```

4. **Enhance trade functions with tracking**:
   ```tsx
   const doTrade = useSafaryTradeTracking({
     account,
     inputCurrencyInfo: {
       /* ... */
     },
     outputCurrencyInfo: {
       /* ... */
     },
     tradeFn: originalDoTrade,
     contractAddress: contractAddress,
     tradeType: SafaryTradeType.SWAP_ORDER,
     label: 'your order type',
   })
   ```

## Implementation Guide

For any order type, follow these steps:

1. **Start with BasicTradeFlowTrackingUpdater for basic tracking**
2. **Enhance order submission with useSafaryTradeTracking**
3. **When ready for complete tracking, upgrade to TradeFlowTrackingUpdater**
4. **Use appropriate trade types and labels for each order type**
