# Order Submitted – Addressable: GTM configuration

This spec configures an Addressable placement event from the existing CoW Swap `order_submitted` dataLayer event. The Addressable pixel is loaded by GTM container `GTM-TBX4BV5M`; do not add Addressable JavaScript to the repo.

## Source Event

Data layer event name: `order_submitted`

Source path:

- `apps/cowswap-frontend/src/widgetEventEmitter.ts` registers lifecycle analytics handlers.
- `libs/analytics/src/widget/orderLifecycleAnalytics.ts` maps `ON_POSTED_ORDER` to `order_submitted`.
- `libs/analytics/src/gtm/CowAnalyticsGtm.ts` pushes string events directly to `window.dataLayer`.

Payload shape as it reaches `window.dataLayer`:

```ts
{
  event: 'order_submitted',

  // Global analytics dimensions, present when context is set.
  dimension_chainId?: string,
  dimension_walletName?: string,
  dimension_customBrowserType?: 'desktop' | 'mobileWeb3' | 'mobileRegular',
  dimension_userAddress?: string,
  dimension_market?: string,
  dimension_injectedWidgetAppId?: string,

  // Order identity.
  walletAddress: string,
  orderId: string,
  chainId: string,
  quoteId?: string,

  // Token and amount fields.
  sellToken: string,
  buyToken: string,
  sellAmount: string,
  buyAmount: string,
  sellTokenSymbol: string,
  buyTokenSymbol: string,
  sellTokenDecimals?: number,
  buyTokenDecimals?: number,
  sellAmountUnits?: string,
  buyAmountUnits?: string,

  // Addressable/Safary-friendly aliases.
  fromCurrencyAddress: string,
  toCurrencyAddress: string,
  fromCurrency: string,
  toCurrency: string,
  fromAmount?: string,
  toAmount?: string,

  // Order classification and execution context.
  orderType: 'SWAP' | 'LIMIT' | 'TWAP' | 'HOOKS' | 'YIELD',
  partiallyFillable?: boolean,
  isEthFlow: boolean,
  isCrossChain: boolean,
  destinationChainId?: number,
  kind: 'sell' | 'buy',
  receiver: string,
  orderCreationHash: string
}
```

Notes:

- Optional keys with `undefined` values are removed before the dataLayer push.
- `orderType` is already present on `order_submitted`; this PR does not change that payload.
- `chainId` is intentionally available both as the order payload field (`chainId`) and, when context is set, as `dimension_chainId`.

## GTM Tag

Mirror the existing `Swap Executed – Addressable` tag pattern.

1. Open GTM container `GTM-TBX4BV5M`.
2. Go to **Tags**.
3. Duplicate the existing **Swap Executed – Addressable** tag, or create a new tag with the same template.
4. Rename it to **Order Submitted – Addressable**.
5. Set **Tag type** to **Addressable Pixel**.
6. Set **Pixel ID** to `534628e617bd491eaf5d614f7ea067d5`.
7. Set **Event Name** to Custom `order_submitted`.
8. Enable the template's mark-as-conversion setting if available. Recommendation: mark this event as a conversion because it represents successful order placement.
9. Configure the event properties using the variables below.
10. Set the trigger to the Custom Event trigger below.
11. Save, preview, test, then publish after review.

## Trigger

Create or reuse this trigger:

| Field                  | Value                                     |
| ---------------------- | ----------------------------------------- |
| Trigger type           | Custom Event                              |
| Event name             | `order_submitted`                         |
| Trigger fires on       | All Custom Events matching the event name |
| Suggested trigger name | `CE - order_submitted`                    |

## Data Layer Variables

Create these variables if they do not already exist.

| Variable name             | Variable type       | Data Layer Variable Name |
| ------------------------- | ------------------- | ------------------------ |
| `DLV - Order ID`          | Data Layer Variable | `orderId`                |
| `DLV - Order Type`        | Data Layer Variable | `orderType`              |
| `DLV - Wallet Address`    | Data Layer Variable | `walletAddress`          |
| `DLV - Chain ID`          | Data Layer Variable | `chainId`                |
| `DLV - Sell Token`        | Data Layer Variable | `sellToken`              |
| `DLV - Buy Token`         | Data Layer Variable | `buyToken`               |
| `DLV - Sell Amount Units` | Data Layer Variable | `sellAmountUnits`        |
| `DLV - Buy Amount Units`  | Data Layer Variable | `buyAmountUnits`         |
| `DLV - From Currency`     | Data Layer Variable | `fromCurrency`           |
| `DLV - To Currency`       | Data Layer Variable | `toCurrency`             |

## Property Mapping

Use the same naming conventions as the existing Addressable lifecycle tag.

| Addressable property | GTM variable                  |
| -------------------- | ----------------------------- |
| `transaction_id`     | `{{DLV - Order ID}}`          |
| `order_id`           | `{{DLV - Order ID}}`          |
| `order_type`         | `{{DLV - Order Type}}`        |
| `wallet_address`     | `{{DLV - Wallet Address}}`    |
| `chain_id`           | `{{DLV - Chain ID}}`          |
| `sell_token`         | `{{DLV - Sell Token}}`        |
| `buy_token`          | `{{DLV - Buy Token}}`         |
| `from_currency`      | `{{DLV - From Currency}}`     |
| `to_currency`        | `{{DLV - To Currency}}`       |
| `from_amount`        | `{{DLV - Sell Amount Units}}` |
| `to_amount`          | `{{DLV - Buy Amount Units}}`  |

Minimum required properties for Addressable audience joins:

- `transaction_id`: use `orderId`.
- `wallet_address`: use `walletAddress`.
- `order_type`: use `orderType`.
- `chain_id`: use `chainId`.

## Preview Checklist

Use GTM Preview / Tag Assistant on a non-production test wallet before publishing.

1. Market swap placement
   - Place a normal market swap.
   - Expected dataLayer event: `order_submitted`.
   - Expected `orderType`: `SWAP`.
   - Expected ID field: `orderId` is the CoW order UID.
   - Expected Addressable tag: **Order Submitted – Addressable** fires once.

2. Limit order placement
   - Place a limit order.
   - Expected dataLayer event: `order_submitted`.
   - Expected `orderType`: `LIMIT`.
   - Expected ID field: `orderId` is the CoW order UID.
   - Expected Addressable tag: **Order Submitted – Addressable** fires once.

3. TWAP placement
   - Place a TWAP order from a test Safe setup.
   - Expected dataLayer event: `order_submitted`.
   - Expected `orderType`: `TWAP`.
   - Expected ID field: `orderId` is the parent/conditional order ID from `getConditionalOrderId`.
   - Expected Addressable tag: **Order Submitted – Addressable** fires once.

For each test, confirm the Addressable request contains `transaction_id`, `wallet_address`, `order_type`, and `chain_id`.

## TWAP Matching Note

TWAP placement emits the parent/conditional order ID computed by `getConditionalOrderId`. Later on-chain settlement and order-book records may use child order UIDs for individual TWAP parts. Matching parent placement events to child settlement rows is an open question for Addressable and settlement-layer reporting. This PR only exposes the placement event and does not attempt to solve parent-to-child TWAP matching.

## Out Of Scope

- No `swap_count`, wallet-history, or audience-bucket computation.
- No backend/API changes.
- No server-side GTM changes.
- No new analytics event names.
- No changes to the Addressable pixel or CSP.
