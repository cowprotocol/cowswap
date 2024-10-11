import { SupportedChainId } from '@cowprotocol/cow-sdk'

const TENDERLY_ORG_NAME = process.env.REACT_APP_TENDERLY_ORG_NAME
const TENDERLY_PROJECT_NAME = process.env.REACT_APP_TENDERLY_PROJECT_NAME

export const getSimulationLink = (simulationId: string): string => {
  return `https://dashboard.tenderly.co/${TENDERLY_ORG_NAME}/${TENDERLY_PROJECT_NAME}/simulator/${simulationId}`
}

export const GOLD_RUSH_CLIENT_NETWORK_MAPPING: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'eth-mainnet',
  [SupportedChainId.SEPOLIA]: 'eth-sepolia',
  [SupportedChainId.GNOSIS_CHAIN]: 'gnosis-mainnet',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum-mainnet',
}
