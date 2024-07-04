import { useSetupTradeAmountsFromUrl } from 'modules/trade'

const params = { onlySell: true }

export function SetupAdvancedOrderAmountsFromUrlUpdater() {
  useSetupTradeAmountsFromUrl(params)

  return null
}
