const TENDERLY_ORG_NAME = process.env.REACT_APP_TENDERLY_ORG_NAME
const TENDERLY_PROJECT_NAME = process.env.REACT_APP_TENDERLY_PROJECT_NAME

export const getSimulationLink = (simulationId: string): string => {
  return `https://dashboard.tenderly.co/${TENDERLY_ORG_NAME}/${TENDERLY_PROJECT_NAME}/simulator/${simulationId}`
}
