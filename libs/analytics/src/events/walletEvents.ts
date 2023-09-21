import { sendEvent } from '../googleAnalytics'
import { Category } from '../types'

export function changeWalletAnalytics(walletName: string) {
  sendEvent({
    category: Category.WALLET,
    action: 'Change Wallet',
    label: walletName,
  })
}

type AddTokenActions = 'Succeeded' | 'Failed'
export function addTokenToMetamaskAnalytics(action: AddTokenActions, symbol: string | undefined) {
  sendEvent({
    category: Category.WALLET,
    action: `Add token to Metamask ${action}`,
    label: symbol,
  })
}
