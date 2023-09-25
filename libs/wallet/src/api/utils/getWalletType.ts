import { GnosisSafeInfo, WalletType } from '../types'

interface GetWalletTypeParams {
  gnosisSafeInfo?: GnosisSafeInfo
  isSmartContractWallet: boolean
}

export function getWalletType({ gnosisSafeInfo, isSmartContractWallet }: GetWalletTypeParams): WalletType {
  if (gnosisSafeInfo) {
    return WalletType.SAFE
  } else if (isSmartContractWallet) {
    return WalletType.SC
  } else {
    return WalletType.EOA
  }
}
