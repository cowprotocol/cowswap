import { useSetupTradeAmountsFromUrl } from 'modules/trade'

const params = { onlySell: true }

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SetupYieldAmountsFromUrlUpdater() {
  useSetupTradeAmountsFromUrl(params)

  return null
}
