import { PixelEvent, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { initCowAnalyticsGoogle, initPixelAnalytics } from '@cowprotocol/analytics'
import { debounce } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'

export const cowAnalytics = initCowAnalyticsGoogle()
export const pixelAnalytics = initPixelAnalytics()
export const webVitalsAnalytics = new WebVitalsAnalytics(cowAnalytics)
webVitalsAnalytics.reportWebVitals()

enum Category {
  TRADE = 'Trade',
  LIST = 'Lists',
  CURRENCY_SELECT = 'Currency Select',
  RECIPIENT_ADDRESS = 'Recipient address',
  ORDER_SLIPAGE_TOLERANCE = 'Order Slippage Tolerance',
  ORDER_EXPIRATION_TIME = 'Order Expiration Time',
  WALLET = 'Wallet',
  WRAP_NATIVE_TOKEN = 'Wrapped Native Token',
  CLAIM_COW_FOR_LOCKED_GNO = 'Claim COW for Locked GNO',
  THEME = 'Theme',
  GAMES = 'Games',
  INIT = 'Init',
  TWAP = 'TWAP',
  COW_FORTUNE = 'CoWFortune',
  SURPLUS_MODAL = 'Surplus Modal',
}

export function shareFortuneTwitterAnalytics() {
  cowAnalytics.sendEvent({
    category: Category.COW_FORTUNE,
    action: 'Share COW Fortune on Twitter',
  })
}

export function openFortuneCookieAnalytics() {
  cowAnalytics.sendEvent({
    category: Category.COW_FORTUNE,
    action: 'Open COW Fortune',
  })
}

type UpdateListLocation = 'Popup' | 'List Select'
export function updateListAnalytics(location: UpdateListLocation, listUrl: string) {
  cowAnalytics.sendEvent({
    category: Category.LIST,
    action: `Update List from ${location}`,
    label: listUrl,
  })
}

type RemoveListAction = 'Start' | 'Confirm'
export function removeListAnalytics(action: RemoveListAction, listUrl: string) {
  cowAnalytics.sendEvent({
    category: Category.LIST,
    action: `${action} Remove List`,
    label: listUrl,
  })
}

export function toggleListAnalytics(enable: boolean, listUrl: string) {
  cowAnalytics.sendEvent({
    category: Category.LIST,
    action: `${enable ? 'Enable' : 'Disable'} List`,
    label: listUrl,
  })
}

type AddListAction = 'Success' | 'Failed'
export function addListAnalytics(action: AddListAction, listURL: string) {
  cowAnalytics.sendEvent({
    category: Category.LIST,
    action: `Add List ${action}`,
    label: listURL,
  })
}

type GameType = 'CoW Runner' | 'MEV Slicer'
export function gameAnalytics(gameType: GameType) {
  cowAnalytics.sendEvent({
    category: Category.GAMES,
    action: `Playing ${gameType} game`,
  })
}

export function toggleRecepientAddressAnalytics(enable: boolean) {
  cowAnalytics.sendEvent({
    category: Category.RECIPIENT_ADDRESS,
    action: 'Toggle Recipient Address',
    label: enable ? 'Enabled' : 'Disabled',
  })
}

export function searchByAddressAnalytics(isAddressSearch: string) {
  cowAnalytics.sendEvent({
    category: Category.CURRENCY_SELECT,
    action: 'Search by address',
    label: isAddressSearch,
  })
}

type SlipageToleranceType = 'Custom' | 'Default'
function _slippageToleranceAnalytics(type: SlipageToleranceType, value: number) {
  cowAnalytics.sendEvent({
    category: Category.ORDER_SLIPAGE_TOLERANCE,
    action: `Set ${type} Slipage Tolerance`,
    value,
  })
}

export const slippageToleranceAnalytics = debounce(([action, value]: [SlipageToleranceType, number]) => {
  _slippageToleranceAnalytics(action, value)
}, 2000)

export function currencySelectAnalytics(field: string, label: string | undefined) {
  cowAnalytics.sendEvent({
    category: Category.CURRENCY_SELECT,
    action: `Change ${field} token`,
    label,
  })
}

export function setMaxSellTokensAnalytics() {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: 'Set Maximum Sell Tokens',
  })
}

function _changeSwapAmountAnalytics(field: string, value: number) {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: `Change ${field} field amount`,
    value,
  })
}

export const changeSwapAmountAnalytics = debounce(([field, value]: [string, number]) => {
  _changeSwapAmountAnalytics(field, value)
}, 2000)

export function switchTokensAnalytics() {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: 'Switch INPUT/OUTPUT tokens',
  })
}

export function initialPriceLoadAnalytics() {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: 'Initial Price estimation',
  })
}

export function toggleDarkModeAnalytics(darkMode: boolean) {
  cowAnalytics.sendEvent({
    category: Category.THEME,
    action: 'Toggle dark/light mode',
    label: `${darkMode ? 'Dark' : 'Light'} mode`,
  })
}

const LABEL_FROM_TYPE: Record<UiOrderType, string> = {
  [UiOrderType.LIMIT]: 'Limit Order',
  [UiOrderType.SWAP]: 'Market Order',
  [UiOrderType.TWAP]: 'TWAP Order',
  [UiOrderType.HOOKS]: 'Hooks',
}

function getClassLabel(orderClass: UiOrderType, label?: string) {
  const classLabel = LABEL_FROM_TYPE[orderClass]
  return label ? `${label}::${classLabel}` : classLabel
}

type ExpirationType = 'Default' | 'Custom'
export function orderExpirationTimeAnalytics(type: ExpirationType, value: number) {
  cowAnalytics.sendEvent({
    category: Category.ORDER_EXPIRATION_TIME,
    action: `Set ${type} Expiration Time`,
    value,
  })
}

type WrapAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function wrapAnalytics(action: WrapAction, message: string) {
  cowAnalytics.sendEvent({
    category: Category.WRAP_NATIVE_TOKEN,
    action: `${action} Wrap/Unwrap Transaction`,
    label: message,
  })
}

type ClaimAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function claimAnalytics(action: ClaimAction, value?: number) {
  cowAnalytics.sendEvent({
    category: Category.CLAIM_COW_FOR_LOCKED_GNO,
    action: `${action} Claim Transaction`,
    value,
  })
}

type ApprovalAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function approvalAnalytics(action: ApprovalAction, label?: string, value?: number) {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: `${action} Token Approval`,
    label,
    value,
  })
}

export type TradeAction =
  | 'Send'
  | 'Error'
  | 'Reject'
  | 'Bundle Approve and Swap'
  | 'Bundled Eth Flow'
  | 'Place Advanced Order'

export function tradeAnalytics(action: TradeAction, orderType: UiOrderType, label?: string, value?: number) {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action,
    label: getClassLabel(orderType, label),
    value,
  })
}

export function signTradeAnalytics(orderType: UiOrderType, label?: string) {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: 'Sign',
    label: getClassLabel(orderType, label),
  })
}

export type OrderType = 'Posted' | 'Executed' | 'Canceled' | 'Expired'
export function orderAnalytics(action: OrderType, orderType: UiOrderType, label?: string) {
  if (action === 'Posted' && pixelAnalytics) {
    pixelAnalytics.sendAllPixels(PixelEvent.POST_TRADE)
  }

  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action,
    label: getClassLabel(orderType, label),
  })
}

export function priceOutOfRangeAnalytics(isUnfillable: boolean, label: string) {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: `Order price is ${isUnfillable ? 'out of' : 'back to'} market`,
    label,
  })
}

export function alternativeModalAnalytics(isEdit: boolean, action: 'clicked' | 'placed') {
  cowAnalytics.sendEvent({
    category: Category.TRADE,
    action: `${isEdit ? 'Edit' : 'Recreate'} order: ${action}`,
  })
}

type TwapWalletCompatibility = 'non-compatible' | 'compatible' | 'safe-that-could-be-converted'
export function twapWalletCompatibilityAnalytics(action: TwapWalletCompatibility) {
  cowAnalytics.sendEvent({
    category: Category.TWAP,
    action: `TWAP wallet compatibility ${action}`,
  })
}

type ModifySafeHandlerAction = 'enabled' | 'disabled'
export function modifySafeHandlerAnalytics(action: ModifySafeHandlerAction) {
  cowAnalytics.sendEvent({
    category: Category.TWAP,
    action: `Modify safe handler checkbox ${action}`,
  })
}

type TwapConversionType = 'initiated' | 'posted' | 'signed' | 'rejected'
export function twapConversionAnalytics(action: TwapConversionType, fallbackHandlerIsNotSet: boolean) {
  if (!fallbackHandlerIsNotSet) {
    return
  }

  cowAnalytics.sendEvent({
    category: Category.TWAP,
    action: `TWAP with conversion: ${action}`,
  })
}

export function openAdvancedOrdersTabAnalytics() {
  cowAnalytics.sendEvent({
    category: Category.TWAP,
    action: 'Open Advanced Orders Tab',
  })
}

export function changeWalletAnalytics(walletName: string) {
  cowAnalytics.sendEvent({
    category: Category.WALLET,
    action: 'Change Wallet',
    label: walletName,
  })
}

type AddTokenActions = 'Succeeded' | 'Failed'
export function watchAssetInWalletAnalytics(action: AddTokenActions, symbol: string | undefined) {
  cowAnalytics.sendEvent({
    category: Category.WALLET,
    action: `Watch asset in wallet ${action}`,
    label: symbol,
  })
}

export function shareSurplusOnTwitter() {
  cowAnalytics.sendEvent({
    category: Category.SURPLUS_MODAL,
    action: `Share on Twitter`,
  })
}
