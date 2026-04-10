import { COINBASE_WALLET_RDNS } from '../../constants'

interface EthereumProviderLike {
  isCoinbaseWallet?: boolean
}

interface IsActiveCoinbaseConnectionParams {
  ethereumProvider?: EthereumProviderLike
  isCoinbaseConnector?: boolean
  isInjectedConnection: boolean
  trustedRdns?: string | null
}

export function isActiveCoinbaseConnection({
  ethereumProvider,
  isCoinbaseConnector = false,
  isInjectedConnection,
  trustedRdns,
}: IsActiveCoinbaseConnectionParams): boolean {
  if (isCoinbaseConnector) {
    return true
  }

  if (!isInjectedConnection) {
    return false
  }

  return trustedRdns === COINBASE_WALLET_RDNS || ethereumProvider?.isCoinbaseWallet === true
}
