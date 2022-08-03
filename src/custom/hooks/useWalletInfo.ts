import WalletConnectProvider from '@walletconnect/web3-provider'
import { WalletConnectConnector } from 'web3-react-walletconnect-connector'
import { useWeb3React } from 'web3-react-core'
import { Web3Provider } from '@ethersproject/providers'
import useENSName from '@src/hooks/useENSName'
import { useMemo } from 'react'
import { NetworkContextName } from 'constants/misc'
import { UNSUPPORTED_WC_WALLETS } from 'constants/index'
import { getProviderType, WalletProvider } from 'connectors'
import { useActiveWeb3Instance } from 'hooks/index'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import useIsArgentWallet from 'hooks/useIsArgentWallet'
import { useAsyncMemo } from 'use-async-memo'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useAtomValue } from 'jotai/utils'

const GNOSIS_SAFE_APP_NAME = 'Gnosis Safe App'
const SAFE_ICON_URL = 'https://apps.gnosis-safe.io/wallet-connect/favicon.ico'

export interface ConnectedWalletInfo {
  chainId?: number
  active: boolean
  account?: string | null
  activeNetwork: boolean // active default connection
  provider?: WalletProvider
  library?: Web3Provider
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

async function checkIsSmartContractWallet(
  address: string | undefined | null,
  web3: Web3Provider | undefined
): Promise<boolean> {
  if (!address || !web3) {
    return false
  }

  try {
    return (await web3.getCode(address)) !== '0x'
  } catch (e) {
    console.debug(`checkIsSmartContractWallet: failed to check address ${address}`, e.message)
    return false
  }
}

function checkIsSupportedWallet(params: {
  walletName?: string
  chainId?: number
  gnosisSafeInfo?: SafeInfoResponse
}): boolean {
  const { walletName } = params

  return !(walletName && UNSUPPORTED_WC_WALLETS.has(walletName))
}

async function getWcPeerMetadata(connector: WalletConnectConnector): Promise<WalletMetaData> {
  const provider = (await connector.getProvider()) as WalletConnectProvider

  // fix for this https://github.com/gnosis/cowswap/issues/1929
  const meta = provider.walletMeta || provider.signer.connection.wc.peerMeta
  if (meta) {
    return {
      walletName: meta.name,
      icon: meta.icons?.length > 0 ? meta.icons[0] : undefined,
    }
  } else {
    return { walletName: undefined, icon: undefined }
  }
}

export function useProviderType(): WalletProvider | undefined {
  const { connector } = useWeb3React()

  return useMemo(() => {
    return getProviderType(connector)
  }, [connector])
}

export function useIsSmartContract(): boolean {
  const { account, chainId } = useWeb3React()
  const web3Instance = useActiveWeb3Instance()
  const isArgentWallet = useIsArgentWallet()

  return useAsyncMemo(
    () => {
      if (account && isArgentWallet) {
        return Promise.resolve(true)
      } else if (account && web3Instance) {
        return checkIsSmartContractWallet(account, web3Instance)
      }

      return undefined
    },
    [account, chainId, isArgentWallet, web3Instance],
    false
  )
}

export function useWalletMetaData(): WalletMetaData {
  const { connector } = useWeb3React()
  const provider = useProviderType()

  return useAsyncMemo<WalletMetaData>(
    () => {
      if (provider === WalletProvider.WALLET_CONNECT) {
        return getWcPeerMetadata(connector as WalletConnectConnector)
      }

      if (provider === WalletProvider.GNOSIS_SAFE) {
        return Promise.resolve({ walletName: GNOSIS_SAFE_APP_NAME, icon: SAFE_ICON_URL })
      }

      return undefined
    },
    [provider],
    { walletName: '', icon: '' }
  )
}

export function useWalletInfo(): ConnectedWalletInfo {
  const { active, account, chainId } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)
  const { ENSName } = useENSName(account ?? undefined)
  const provider = useProviderType()
  const { walletName, icon } = useWalletMetaData()
  const gnosisSafeInfo = useAtomValue(gnosisSafeAtom)
  const isSmartContractWallet = useIsSmartContract()

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

export function useIsGnosisSafeApp(): boolean {
  const { walletName } = useWalletInfo()

  return walletName === GNOSIS_SAFE_APP_NAME
}
