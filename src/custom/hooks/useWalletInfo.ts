import WalletConnectProvider from '@walletconnect/web3-provider'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import useENSName from '@src/hooks/useENSName'
import { useEffect, useState } from 'react'
import { NetworkContextName, UNSUPPORTED_WC_WALLETS } from 'constants/index'
import { getProviderType, WalletProvider } from 'connectors'
import { useActiveWeb3Instance } from 'hooks/index'

export interface ConnectedWalletInfo {
  active: boolean
  account?: string | null
  activeNetwork: boolean // active default connection
  provider?: WalletProvider
  isSmartContractWallet: boolean
  walletName?: string
  ensName?: string
  icon?: string
  isSupportedWallet: boolean
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

function checkIsSupportedWallet(name: string | undefined, isSmartContractWallet: boolean): boolean {
  return !isSmartContractWallet && !UNSUPPORTED_WC_WALLETS.has(name || '')
}

async function getWcPeerMetadata(connector: WalletConnectConnector): Promise<{ walletName?: string; icon?: string }> {
  const provider = (await connector.getProvider()) as WalletConnectProvider

  const meta = provider.walletMeta
  if (meta) {
    return {
      walletName: meta.name,
      icon: meta.icons?.length > 0 ? meta.icons[0] : undefined
    }
  } else {
    return { walletName: undefined, icon: undefined }
  }
}

export function useWalletInfo(): ConnectedWalletInfo {
  const { active, account, connector } = useWeb3React()
  const web3Instance = useActiveWeb3Instance()
  const [walletName, setWalletName] = useState<string>()
  const [icon, setIcon] = useState<string>()
  const [provider, setProvider] = useState<WalletProvider>()
  const [isSmartContractWallet, setIsSmartContractWallet] = useState(false)
  const contextNetwork = useWeb3React(NetworkContextName)
  const { ENSName } = useENSName(account ?? undefined)

  useEffect(() => {
    // Set the current provider
    setProvider(getProviderType(connector))

    // If the connector is wallet connect, try to get the wallet name and icon
    if (connector instanceof WalletConnectConnector) {
      getWcPeerMetadata(connector).then(({ walletName, icon }) => {
        setWalletName(walletName)
        setIcon(icon)
      })
    }
  }, [connector])

  useEffect(() => {
    if (account && web3Instance) {
      checkIsSmartContractWallet(account, web3Instance).then(setIsSmartContractWallet)
    }
  }, [account, web3Instance])

  return {
    active,
    account,
    activeNetwork: contextNetwork.active,
    provider,
    isSmartContractWallet,
    walletName,
    icon,
    ensName: ENSName || undefined,
    isSupportedWallet: checkIsSupportedWallet(walletName, isSmartContractWallet)
  }
}
