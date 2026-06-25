import { BRAVE_WALLET_RDNS, METAMASK_RDNS, RABBY_RDNS } from '../../constants'
import { ConnectionType } from '../types'

export type WalletRdns = typeof METAMASK_RDNS | typeof RABBY_RDNS | typeof BRAVE_WALLET_RDNS

type WalletIdentityConnector = {
  id?: string
  name?: string
  type?: string
}

type WalletProviderFlags = {
  isBraveWallet?: boolean
  isMetaMask?: boolean
  isRabby?: boolean
}

const WALLET_NAMES_BY_RDNS: Record<WalletRdns, string> = {
  [BRAVE_WALLET_RDNS]: 'Brave Wallet',
  [METAMASK_RDNS]: 'MetaMask',
  [RABBY_RDNS]: 'Rabby Wallet',
}

const KNOWN_WALLET_RDNSES = new Set<string>([BRAVE_WALLET_RDNS, METAMASK_RDNS, RABBY_RDNS])

export function isGenericInjectedConnector(connector?: WalletIdentityConnector): boolean {
  return connector?.type === ConnectionType.INJECTED && connector.id === 'injected'
}

function getKnownConnectorRdns(connector?: WalletIdentityConnector): WalletRdns | undefined {
  const connectorId = connector?.id

  return connectorId && KNOWN_WALLET_RDNSES.has(connectorId) ? (connectorId as WalletRdns) : undefined
}

function getWalletRdnsFromName(name?: string): WalletRdns | undefined {
  const normalizedName = name?.trim().toLowerCase()

  if (!normalizedName) return undefined

  if (normalizedName.includes('rabby')) return RABBY_RDNS
  if (normalizedName.includes('brave')) return BRAVE_WALLET_RDNS
  if (normalizedName.includes('metamask') || normalizedName.includes('meta mask')) return METAMASK_RDNS

  return undefined
}

function readProviderFlag(provider: unknown, flag: keyof WalletProviderFlags): boolean {
  if (!provider || typeof provider !== 'object') return false

  try {
    return Boolean((provider as WalletProviderFlags)[flag])
  } catch {
    return false
  }
}

function getWalletRdnsFromInjectedProvider(provider: unknown): WalletRdns | undefined {
  // Some wallets expose MetaMask compatibility flags. Prefer more specific flags first.
  if (readProviderFlag(provider, 'isRabby')) return RABBY_RDNS
  if (readProviderFlag(provider, 'isBraveWallet')) return BRAVE_WALLET_RDNS
  if (readProviderFlag(provider, 'isMetaMask')) return METAMASK_RDNS

  return undefined
}

export function getWalletRdns(params: {
  connector?: WalletIdentityConnector
  provider?: unknown
  walletName?: string
}): WalletRdns | undefined {
  const { connector, provider, walletName } = params

  return (
    getKnownConnectorRdns(connector) ||
    getWalletRdnsFromName(connector?.name) ||
    getWalletRdnsFromName(walletName) ||
    (isGenericInjectedConnector(connector) ? getWalletRdnsFromInjectedProvider(provider) : undefined)
  )
}

export function getWalletNameFromRdns(rdns?: string): string | undefined {
  return rdns && KNOWN_WALLET_RDNSES.has(rdns) ? WALLET_NAMES_BY_RDNS[rdns as WalletRdns] : undefined
}

export function getWalletDisplayName(params: {
  connector?: WalletIdentityConnector
  provider?: unknown
  walletName?: string
}): string | undefined {
  const { connector, walletName } = params
  const resolvedName = getWalletNameFromRdns(getWalletRdns(params))

  if (isGenericInjectedConnector(connector)) {
    return getWalletRdnsFromName(walletName) ? walletName : resolvedName || walletName || connector?.name
  }

  return connector?.name || walletName || resolvedName
}
