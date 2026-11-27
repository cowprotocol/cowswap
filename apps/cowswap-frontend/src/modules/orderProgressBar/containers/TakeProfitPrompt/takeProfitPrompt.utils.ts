import { CowSwapWidgetAppParams, TradeType } from '@cowprotocol/widget-lib'

export function isTakeProfitPromptEnabled({
  enabledTradeTypes,
  disablePricePercentageShortcuts,
}: Pick<Partial<CowSwapWidgetAppParams>, 'enabledTradeTypes' | 'disablePricePercentageShortcuts'>): boolean {
  if (disablePricePercentageShortcuts) return false
  if (enabledTradeTypes && !enabledTradeTypes.includes(TradeType.LIMIT)) return false
  return true
}
