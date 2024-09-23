import { providers } from 'ethers'

const TENDERLY_VIRTUAL_TESTNET_RPC = process.env.TENDERLY_RPC
export const TENDERLY_TESTNET_PROVIDER = new providers.JsonRpcProvider(TENDERLY_VIRTUAL_TESTNET_RPC)
