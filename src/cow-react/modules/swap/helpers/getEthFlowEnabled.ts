import { isProd } from 'utils/environments'

// const ETH_FLOW_ENABLED_LOCAL_STORAGE_KEY = 'enableEthFlow'

// TODO: disabled only for testing, DO NOT MERGE!!!
export function getEthFlowEnabled(isSmartContractWallet: boolean): boolean {
  return !isProd && !isSmartContractWallet
}
