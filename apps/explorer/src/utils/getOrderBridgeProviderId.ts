import { cowAppDataLatestScheme } from '@cowprotocol/cow-sdk'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '@cowprotocol/sdk-bridging'

export function getOrderBridgeProviderId(order: EnrichedOrder): string | undefined {
  if (!order.fullAppData) return

  try {
    const appData = JSON.parse(order.fullAppData) as cowAppDataLatestScheme.AppDataRootSchema

    const bridgeProviderId = appData.metadata.bridging?.providerId

    if (bridgeProviderId) return bridgeProviderId

    const postHooks = appData.metadata.hooks?.post || []
    const bridgeHooks = postHooks.filter((hook) => hook.dappId?.startsWith(HOOK_DAPP_BRIDGE_PROVIDER_PREFIX))

    return bridgeHooks[0]?.dappId
  } catch {
    return
  }
}
