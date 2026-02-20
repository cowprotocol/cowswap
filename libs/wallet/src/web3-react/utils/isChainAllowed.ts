import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { getWeb3ReactConnection } from './getWeb3ReactConnection'
import { parseEvmChainId } from './parseChainId'

import { ConnectionType } from '../../api/types'

const allowedChainsByWallet: Record<ConnectionType, SupportedChainId[]> = {
  [ConnectionType.INJECTED]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.METAMASK]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.COINBASE_WALLET]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.WALLET_CONNECT_V2]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.NETWORK]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.GNOSIS_SAFE]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.TREZOR]: ALL_SUPPORTED_CHAIN_IDS,
}

export function isChainAllowed(connector: Connector, chainId: string | number): boolean {
  const connection = getWeb3ReactConnection(connector)
  const parsedChainId = parseEvmChainId(chainId)

  return allowedChainsByWallet[connection.type].includes(parsedChainId as SupportedChainId)
}
