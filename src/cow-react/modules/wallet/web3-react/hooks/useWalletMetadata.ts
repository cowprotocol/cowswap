import { useWeb3React } from '@web3-react/core'
import { getWeb3ReactConnection } from '@cow/modules/wallet/web3-react/connection'
import { ConnectionType } from '@cow/modules/wallet'
import { useMemo } from 'react'
import { getIsAlphaWallet } from '@cow/modules/wallet/api/utils/connection'

const WC_DESKTOP_GNOSIS_SAFE_APP_NAME = 'WalletConnect Safe App'
const WC_MOBILE_GNOSIS_SAFE_APP_NAME = 'Safe'
const GNOSIS_SAFE_APP_NAME = 'Gnosis Safe App'
const GNOSIS_APP_NAMES = [GNOSIS_SAFE_APP_NAME, WC_DESKTOP_GNOSIS_SAFE_APP_NAME, WC_MOBILE_GNOSIS_SAFE_APP_NAME]

const SAFE_ICON_URL = 'https://app.safe.global/favicon.ico'
const ALPHA_WALLET_ICON_URL = 'https://alphawallet.com/wp-content/themes/alphawallet/img/logo-horizontal-new.svg'

const METADATA_DISCONNECTED: WalletMetaData = {
  walletName: undefined,
  icon: undefined,
}

const METADATA_SAFE: WalletMetaData = {
  walletName: GNOSIS_SAFE_APP_NAME,
  icon: SAFE_ICON_URL,
}

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

function getWcWalletIcon(meta: any) {
  if (getIsAlphaWallet(meta.name)) {
    return ALPHA_WALLET_ICON_URL
  }

  return meta.icons?.length > 0 ? meta.icons[0] : undefined
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
      icon: getWcWalletIcon(meta),
    }
  }

  return defaultOutput
}

// FIXME: I notice this function is not calculating always correctly the walletName. Out of scope of this PR to fix. "getConnnectionName" might help
export function useWalletMetaData(): WalletMetaData {
  const { connector, provider, account } = useWeb3React()
  const connectionType = getWeb3ReactConnection(connector).type

  return useMemo<WalletMetaData>(() => {
    if (!account) {
      return METADATA_DISCONNECTED
    }

    if (connectionType === ConnectionType.WALLET_CONNECT) {
      const wc = provider?.provider

      if ((wc as any)?.isWalletConnect) {
        return getWcPeerMetadata(wc)
      }
    }

    if (connectionType === ConnectionType.GNOSIS_SAFE) {
      return METADATA_SAFE
    }

    return METADATA_DISCONNECTED
  }, [connectionType, provider, account])
}

export function useIsGnosisSafeApp(): boolean {
  const { walletName } = useWalletMetaData()

  return walletName === GNOSIS_SAFE_APP_NAME
}

// Safe App, WC desktop, WC mobile
export function useIsGnosisApp(): boolean {
  const { walletName } = useWalletMetaData()

  if (!walletName) return false

  return GNOSIS_APP_NAMES.includes(walletName)
}

export function useIsGnosisSafeWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return !!walletName?.startsWith('Gnosis Safe')
}
