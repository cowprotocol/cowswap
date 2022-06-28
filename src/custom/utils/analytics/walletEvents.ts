import { Category, _reportEvent } from './index'

export function changeWalletAnalytics(walletName: string) {
  _reportEvent({
    category: Category.WALLET,
    action: 'Change Wallet',
    label: walletName,
  })
}
