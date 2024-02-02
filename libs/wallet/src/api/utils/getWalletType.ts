import { GnosisSafeInfo, WalletType } from '../types'

interface GetWalletTypeParams {
  gnosisSafeInfo?: GnosisSafeInfo
  isSmartContractWallet: boolean | undefined
}

export function getWalletType({ gnosisSafeInfo, isSmartContractWallet }: GetWalletTypeParams): WalletType {
  if (gnosisSafeInfo) {
    return WalletType.SAFE
  } else if (isSmartContractWallet === true) {
    return WalletType.SC
  } else {
    return WalletType.EOA
  }
}
