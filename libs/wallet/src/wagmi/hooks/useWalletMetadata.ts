import { useConnection } from 'wagmi'

const SAFE_APP_NAME = 'Safe App'

const SAFE_ICON_URL = 'https://app.safe.global/favicon.ico'

const METADATA_DISCONNECTED: WalletMetaData = {
  walletName: undefined,
  icon: undefined,
}

const _METADATA_SAFE: WalletMetaData = {
  walletName: SAFE_APP_NAME,
  icon: SAFE_ICON_URL,
}

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

export function useWalletMetaData(_standaloneMode?: boolean): WalletMetaData {
  const { connector } = useConnection()

  if (!connector) {
    return METADATA_DISCONNECTED
  }

  return {
    walletName: connector.name,
    icon: connector.icon,
  }
}
