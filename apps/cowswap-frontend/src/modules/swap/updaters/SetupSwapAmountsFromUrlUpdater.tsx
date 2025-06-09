import { useSetupTradeAmountsFromUrl } from 'modules/trade'

const params = {}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SetupSwapAmountsFromUrlUpdater() {
  useSetupTradeAmountsFromUrl(params)

  return null
}
