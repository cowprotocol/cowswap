const INFURA_KEY = process.env.REACT_APP_INFURA_KEY

const MAINNET_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_KEY}`
const GOERLI_RPC_URL = `https://goerli.infura.io/v3/${INFURA_KEY}`
const POLYGON_RPC_URL = 'https://polygon-mainnet.infura.io/v3/'
const GNOSIS_CHAIN_URL = 'https://rpc.gnosischain.com/'

export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  GNOSIS_CHAIN = 100,
  POLYGON = 137,
}

export const MAINET_HEX = '0x1'
export const GOERLI_HEX = '0x5'
export const POLYGON_HEX = '0x64'
export const GNOSIS_CHAIN_HEX = '0x89'

export const mainet = {
  id: MAINET_HEX,
  token: 'ETH',
  label: 'Ethereum Mainnet',
  rpcUrl: MAINNET_RPC_URL,
}

export const goerli = {
  id: GOERLI_HEX,
  token: 'görETH',
  label: 'Görli',
  rpcUrl: GOERLI_RPC_URL,
}

export const polygon = {
  id: POLYGON_HEX,
  token: 'MATIC',
  label: 'Polygon',
  rpcUrl: POLYGON_RPC_URL,
}

export const gnosisChain = {
  id: GNOSIS_CHAIN_HEX,
  token: 'XDAI',
  label: 'Gnosis Chain',
  rpcUrl: GNOSIS_CHAIN_URL,
}
