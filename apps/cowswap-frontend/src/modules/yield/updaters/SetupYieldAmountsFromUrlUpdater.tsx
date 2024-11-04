import { useSetupTradeAmountsFromUrl } from 'modules/trade'

const params = { onlySell: true }

export function SetupYieldAmountsFromUrlUpdater() {
  useSetupTradeAmountsFromUrl(params)

  return null
}
