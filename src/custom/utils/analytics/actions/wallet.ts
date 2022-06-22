import { Category } from '../types'
import { _reportEvent } from '../utils'

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
