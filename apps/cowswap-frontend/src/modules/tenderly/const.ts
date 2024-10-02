import { providers } from 'ethers'

export const TENDERLY_TESTNET_PROVIDER = new providers.JsonRpcProvider(process.env.TENDERLY_VNET_RPC)
// Sorry Safe, you need to set up CORS policy :)
// TODO: run our own instance
export const TENDERLY_API_BASE_ENDPOINT = process.env.REACT_APP_TENDERLY_SIMULATE_ENDPOINT_URL

const TENDERLY_ORG_NAME = 'yvesfracari'
const TENDERLY_PROJECT_NAME = 'personal'

export const getSimulationLink = (simulationId: string): string => {
  return `https://dashboard.tenderly.co/${TENDERLY_ORG_NAME}/${TENDERLY_PROJECT_NAME}/simulator/${simulationId}`
}
