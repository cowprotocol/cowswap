import { useSetupTradeAmountsFromUrl } from 'modules/trade'

const params = {}

export function SetupSwapAmountsFromUrlUpdater() {
  useSetupTradeAmountsFromUrl(params)

  return null
}
