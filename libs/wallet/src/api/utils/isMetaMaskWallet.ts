import { METAMASK_RDNS } from '../../constants'

interface EthereumProviderLike {
  isMetaMask?: boolean
  isRabby?: boolean
}

interface IsMetaMaskWalletParams {
  connectorName?: string
  ethereumProvider?: EthereumProviderLike
  rdns?: string | null
}

function hasMetaMaskRdns(rdns: string | null | undefined): boolean {
  return Boolean(rdns?.startsWith(METAMASK_RDNS))
}

function isMetaMaskProvider(ethereumProvider: EthereumProviderLike | undefined): boolean {
  return Boolean(ethereumProvider?.isMetaMask && !ethereumProvider?.isRabby)
}

export function isMetaMaskWallet({ connectorName, ethereumProvider, rdns }: IsMetaMaskWalletParams): boolean {
  return (
    connectorName?.trim().toLowerCase() === 'metamask' || hasMetaMaskRdns(rdns) || isMetaMaskProvider(ethereumProvider)
  )
}
