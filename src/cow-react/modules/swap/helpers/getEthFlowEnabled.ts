import { isProd } from 'utils/environments'

export function getEthFlowEnabled(isSmartContractWallet: boolean): boolean {
  return !isProd && !isSmartContractWallet
}
