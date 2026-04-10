import { METAMASK_RDNS } from '../../constants'

interface EthereumProviderLike {
  isMetaMask?: boolean
  isRabby?: boolean
}

interface IsMetaMaskWalletParams {
  connectorName?: string
  ethereumProvider?: EthereumProviderLike
  trustedRdns?: string | null
}

function hasMetaMaskRdns(rdns: string | null | undefined): boolean {
  return Boolean(rdns?.startsWith(METAMASK_RDNS))
}

function isMetaMaskProvider(ethereumProvider: EthereumProviderLike | undefined): boolean {
  return Boolean(ethereumProvider?.isMetaMask && !ethereumProvider?.isRabby)
}

export function isMetaMaskWallet({ connectorName, ethereumProvider, trustedRdns }: IsMetaMaskWalletParams): boolean {
  if (typeof trustedRdns === 'string') {
    return hasMetaMaskRdns(trustedRdns)
  }

  return connectorName?.trim().toLowerCase() === 'metamask' || isMetaMaskProvider(ethereumProvider)
}
