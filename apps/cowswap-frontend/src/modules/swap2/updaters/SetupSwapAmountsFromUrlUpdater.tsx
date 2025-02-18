import { useSetupTradeAmountsFromUrl } from 'modules/trade'

const params = { onlySell: true }

export function SetupSwapAmountsFromUrlUpdater() {
  useSetupTradeAmountsFromUrl(params)

  return null
}
