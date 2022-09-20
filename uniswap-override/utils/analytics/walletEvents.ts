import { Category, reportEvent } from './index'

export function changeWalletAnalytics(walletName: string) {
  reportEvent({
    category: Category.WALLET,
    action: 'Change Wallet',
    label: walletName,
  })
}

type AddTokenActions = 'Succeeded' | 'Failed'
export function addTokenToMetamaskAnalytics(action: AddTokenActions, symbol: string | undefined) {
  reportEvent({
    category: Category.WALLET,
    action: `Add token to Metamask ${action}`,
    label: symbol,
  })
}
