import { isProd } from 'utils/environments'

const ETH_FLOW_ENABLED_LOCAL_STORAGE_KEY = 'enableEthFlow'

export function getEthFlowEnabled(isSmartContractWallet: boolean): boolean {
  return !isProd && !isSmartContractWallet && localStorage.getItem(ETH_FLOW_ENABLED_LOCAL_STORAGE_KEY) === '1'
}
