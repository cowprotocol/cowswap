import { Category, _reportEvent } from './index'

const types = {
  change: 'Change Wallet',
}

export function changeWalletAnalytics(walletName: string) {
  _reportEvent({
    category: Category.WALLET,
    action: types.change,
    label: walletName,
  })
}
