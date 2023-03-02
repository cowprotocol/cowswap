import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import useENSName from '@src/hooks/useENSName'
import { UNSUPPORTED_WC_WALLETS } from 'constants/index'
import { getConnection } from '@cow/modules/wallet/api/utils'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { ConnectionType } from 'connection'
import { useIsSmartContractWallet } from '@cow/common/hooks/useIsSmartContractWallet'
import { useAtomValue } from 'jotai/utils'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useMemo } from 'react'

const GNOSIS_SAFE_APP_NAME = 'Gnosis Safe App'
const SAFE_ICON_URL = 'https://app.safe.global/favicon.ico'

export interface ConnectedWalletInfo {
  chainId?: number
  active?: boolean
  account?: string | null
  provider?: Web3Provider
  isSmartContractWallet: boolean
  walletName?: string
  ensName?: string
  icon?: string
  isSupportedWallet: boolean
  allowsOffchainSigning: boolean
  gnosisSafeInfo?: SafeInfoResponse
}

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

function checkIsSupportedWallet(walletName?: string): boolean {
  if (walletName && UNSUPPORTED_WC_WALLETS.has(walletName)) {
    // Unsupported wallet
    return false
  }

  return true
}

function getWcPeerMetadata(provider: any | undefined): WalletMetaData {
  // fix for this https://github.com/gnosis/cowswap/issues/1929
  const defaultOutput = { walletName: undefined, icon: undefined }

  if (!provider) {
    return defaultOutput
  }

  const meta = provider.connector.peerMeta

  if (meta) {
    return {
      walletName: meta.name,
      icon: meta.icons?.length > 0 ? meta.icons[0] : undefined,
    }
  }

  return defaultOutput
}

export function useWalletMetaData(): WalletMetaData {
  const { connector, provider } = useWeb3React()
  const connectionType = getConnection(connector).type

  return useMemo<WalletMetaData>(() => {
    if (connectionType === ConnectionType.WALLET_CONNECT) {
      const wc = provider?.provider

      if ((wc as any)?.isWalletConnect) {
        return getWcPeerMetadata(wc)
      }
    }

    if (connectionType === ConnectionType.GNOSIS_SAFE) {
      return {
        walletName: GNOSIS_SAFE_APP_NAME,
        icon: SAFE_ICON_URL,
      }
    }

    return { walletName: '', icon: '' }
  }, [connectionType, provider])
}

export function useWalletInfo(): ConnectedWalletInfo {
  const { account, provider, chainId, isActive: active } = useWeb3React()
  const { ENSName } = useENSName(account ?? undefined)
  const gnosisSafeInfo = useAtomValue(gnosisSafeAtom)
  const isSmartContractWallet = useIsSmartContractWallet()
  const { walletName, icon } = useWalletMetaData()

  return {
    chainId,
    active,
    account,
    provider,
    isSmartContractWallet,
    walletName,
    icon,
    ensName: ENSName || undefined,
    isSupportedWallet: checkIsSupportedWallet(walletName),

    // TODO: For now, all SC wallets use pre-sign instead of offchain signing
    // In the future, once the API adds EIP-1271 support, we can allow some SC wallets to use offchain signing
    allowsOffchainSigning: !isSmartContractWallet,
    gnosisSafeInfo,
  }
}

export function useIsGnosisSafeApp(): boolean {
  const { walletName } = useWalletMetaData()

  return walletName === GNOSIS_SAFE_APP_NAME
}

export function useIsGnosisSafeWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return !!walletName?.startsWith('Gnosis Safe')
}
