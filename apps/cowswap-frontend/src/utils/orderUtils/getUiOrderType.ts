import { SOLANA_LIMIT_ORDER_PROD_APP_DATA, SOLANA_LIMIT_ORDER_STAGING_APP_DATA } from '@cowprotocol/common-const'
import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { Order } from 'legacy/state/orders/actions'

import { AppDataMetadataOrderClass } from 'modules/appData/types'
import { decodeAppData } from 'modules/appData/utils/decodeAppData'

const APPDATA_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP: Record<string, UiOrderType> = {
  market: UiOrderType.SWAP,
  limit: UiOrderType.LIMIT,
  liquidity: UiOrderType.LIMIT,
  twap: UiOrderType.TWAP,
  hooks: UiOrderType.HOOKS,
}

const API_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP: Record<OrderClass, UiOrderType> = {
  [OrderClass.MARKET]: UiOrderType.SWAP,
  [OrderClass.LIMIT]: UiOrderType.LIMIT,
  [OrderClass.LIQUIDITY]: UiOrderType.LIMIT,
}

export type UiOrderTypeParams = Pick<Order, 'fullAppData' | 'composableCowInfo' | 'class'> & {
  // Optional and structurally narrow (chainId only): several existing callers pass order shapes
  // (SerializedOrder pre-deserialization, ParsedOrder, lifecycle-event sources, ...) that either lack
  // `appData` entirely or carry a `SerializedToken` instead of a full `Token` class instance for
  // `inputToken`. Neither is available, the Solana check below is simply skipped — same as any other
  // order for which it doesn't apply.
  appData?: Order['appData']
  inputToken?: Pick<Order['inputToken'], 'chainId'>
}

export function getUiOrderType({
  fullAppData,
  composableCowInfo,
  class: orderClass,
  appData,
  inputToken,
}: UiOrderTypeParams): UiOrderType {
  // 1. Only TWAP orders have composableCowInfo, so it takes precedence over everything else.
  if (composableCowInfo) {
    return UiOrderType.TWAP
  }

  // 2. Solana has no real appData-doc convention yet (unlike EVM's keccak256-of-a-JSON-doc) — a limit
  // order signs one of these two pre-agreed constants as its opaque appData bytes, and that raw value is
  // the only signal available to tell it apart from a market order. See common/constants/solanaAppData.ts.
  if (isSolanaLimitOrderAppData(inputToken, appData)) {
    return UiOrderType.LIMIT
  }

  const parsedAppData = decodeAppData(fullAppData)

  const appDataOrderClass = parsedAppData?.metadata?.orderClass as AppDataMetadataOrderClass | undefined
  const typeFromAppData = APPDATA_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP[appDataOrderClass?.orderClass || '']

  // 3. Take value from AppData if presented
  if (typeFromAppData) {
    return typeFromAppData
  }

  // 4. As a last resort, map it to API classification.
  // Least precise as it doesn't distinguish twap type and uses backend logic which doesn't match frontend's classification
  return API_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP[orderClass]
}

function isSolanaLimitOrderAppData(
  inputToken: UiOrderTypeParams['inputToken'],
  appData: UiOrderTypeParams['appData'],
): boolean {
  const isSolanaOrder = inputToken?.chainId === SupportedChainId.SOLANA

  return (
    isSolanaOrder && (appData === SOLANA_LIMIT_ORDER_STAGING_APP_DATA || appData === SOLANA_LIMIT_ORDER_PROD_APP_DATA)
  )
}
