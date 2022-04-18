import WalletConnectProvider from '@walletconnect/web3-provider'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useWeb3React } from 'web3-react-core'
import { Web3Provider } from '@ethersproject/providers'
import useENSName from '@src/hooks/useENSName'
import { useEffect, useState } from 'react'
import { NetworkContextName } from 'constants/misc'
import { UNSUPPORTED_WC_WALLETS } from 'constants/index'
import { getProviderType, WalletProvider } from 'connectors'
import { useActiveWeb3Instance } from 'hooks/index'
import { getSafeInfo } from 'api/gnosisSafe'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'

const GNOSIS_SAFE_APP_NAME = 'Gnosis Safe App'
const GNOSIS_SAFE_WALLET_NAMES = ['Gnosis Safe Multisig', 'Gnosis Safe', GNOSIS_SAFE_APP_NAME]
const SAFE_ICON_URL = 'https://apps.gnosis-safe.io/wallet-connect/favicon.ico'

export interface ConnectedWalletInfo {
  chainId?: number
  active: boolean
  account?: string | null
  activeNetwork: boolean // active default connection
  provider?: WalletProvider
  isSmartContractWallet: boolean
  walletName?: string
  ensName?: string
  icon?: string
  isSupportedWallet: boolean
  allowsOffchainSigning: boolean
  gnosisSafeInfo?: SafeInfoResponse
}

async function checkIsSmartContractWallet(
  address: string | undefined | null,
  web3: Web3Provider | undefined
): Promise<boolean> {
  if (!address || !web3) {
    return false
  }

  const code = await web3.getCode(address)
  return code !== '0x'
}

function checkIsSupportedWallet(params: {
  walletName?: string
  chainId?: number
  gnosisSafeInfo?: SafeInfoResponse
}): boolean {
  const { walletName } = params

  if (walletName && UNSUPPORTED_WC_WALLETS.has(walletName)) {
    // Unsupported wallet
    return false
  }

  return true
}

async function getWcPeerMetadata(connector: WalletConnectConnector): Promise<{ walletName?: string; icon?: string }> {
  const provider = (await connector.getProvider()) as WalletConnectProvider

  const meta = provider.walletMeta
  if (meta) {
    return {
      walletName: meta.name,
      icon: meta.icons?.length > 0 ? meta.icons[0] : undefined,
    }
  } else {
    return { walletName: undefined, icon: undefined }
  }
}

export function useWalletInfo(): ConnectedWalletInfo {
  const { active, account, connector, chainId } = useWeb3React()
  const web3Instance = useActiveWeb3Instance()
  const [walletName, setWalletName] = useState<string>()
  const [icon, setIcon] = useState<string>()
  const [provider, setProvider] = useState<WalletProvider>()
  const [isSmartContractWallet, setIsSmartContractWallet] = useState(false)
  const contextNetwork = useWeb3React(NetworkContextName)
  const { ENSName } = useENSName(account ?? undefined)
  const [gnosisSafeInfo, setGnosisSafeInfo] = useState<SafeInfoResponse>()

  useEffect(() => {
    // Set the current provider
    setProvider(getProviderType(connector))

    // Reset name and icon when provider changes
    // These values are only set for WC wallets
    // When connect is not WC, leave them empty
    setWalletName('')
    setIcon('')

    // If the connector is wallet connect, try to get the wallet name and icon
    const walletType = getProviderType(connector)
    switch (walletType) {
      case WalletProvider.WALLET_CONNECT:
        if (connector instanceof WalletConnectConnector) {
          getWcPeerMetadata(connector).then(({ walletName, icon }) => {
            setWalletName(walletName)
            setIcon(icon)
          })
        }
        break
      case WalletProvider.GNOSIS_SAFE:
        setWalletName(GNOSIS_SAFE_APP_NAME)
        setIcon(SAFE_ICON_URL)
        break
    }
  }, [connector])

  useEffect(() => {
    if (account && web3Instance) {
      checkIsSmartContractWallet(account, web3Instance).then(setIsSmartContractWallet)
    }
  }, [account, web3Instance])

  useEffect(() => {
    const isGnosisSafe = walletName && GNOSIS_SAFE_WALLET_NAMES.includes(walletName)

    if (chainId && account && isGnosisSafe) {
      getSafeInfo(chainId, account)
        .then(setGnosisSafeInfo)
        .catch((error) => {
          console.error('[api/gnosisSafe] Error fetching GnosisSafe info', error)
        })
    } else {
      setGnosisSafeInfo(undefined)
    }
  }, [chainId, account, walletName])

  return {
    chainId,
    active,
    account,
    activeNetwork: contextNetwork.active,
    provider,
    isSmartContractWallet,
    walletName,
    icon,
    ensName: ENSName || undefined,
    isSupportedWallet: checkIsSupportedWallet({ walletName, chainId, gnosisSafeInfo }),

    // TODO: For now, all SC wallets use pre-sign instead of offchain signing
    // In the future, once the API adds EIP-1271 support, we can allow some SC wallets to use offchain signing
    allowsOffchainSigning: !isSmartContractWallet,
    gnosisSafeInfo,
  }
}
