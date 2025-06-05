import { latest } from '@cowprotocol/app-data'
import { EnrichedOrder, HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '@cowprotocol/cow-sdk'

export function getOrderBridgeProviderId(order: EnrichedOrder): string | undefined {
  if (!order.fullAppData) return

  try {
    const appData = JSON.parse(order.fullAppData) as latest.AppDataRootSchema

    const postHooks = appData.metadata.hooks?.post || []
    const bridgeHooks = postHooks.filter((hook) => hook.dappId?.startsWith(HOOK_DAPP_BRIDGE_PROVIDER_PREFIX))

    return bridgeHooks[0]?.dappId
  } catch {
    return
  }
}
