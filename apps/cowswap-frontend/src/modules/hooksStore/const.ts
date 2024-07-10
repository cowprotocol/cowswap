export const HOOKS_TRAMPOLINE_ADDRESS = '0x01dcb88678aedd0c4cc9552b20f4718550250574'
export const SBC_DEPOSIT_CONTRACT_ADDRESS = '0x0B98057eA310F4d31F2a452B414647007d1645d9'

// Sorry Safe, you need to set up CORS policy :)
// TODO: run our own instance
export const TENDERLY_SIMULATE_ENDPOINT_URL =
  process.env.REACT_APP_TENDERLY_SIMULATE_ENDPOINT_URL || 'https://simulation.safe.global/'

const TENDERLY_ORG_NAME = 'safe'
const TENDERLY_PROJECT_NAME = 'safe-apps'

export const getSimulationLink = (simulationId: string): string => {
  return `https://dashboard.tenderly.co/public/${TENDERLY_ORG_NAME}/${TENDERLY_PROJECT_NAME}/simulator/${simulationId}`
}
