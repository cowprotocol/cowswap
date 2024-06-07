import { useSetupTradeAmountsFromUrl } from 'modules/trade'

export function SetupAdvancedOrderAmountsFromUrlUpdater() {
  useSetupTradeAmountsFromUrl({ onlySell: true })

  return null
}
