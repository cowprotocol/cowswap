import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'

import { createPublicClient, http } from 'viem'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType } from '../../api/types'
import { isEip7702EOA } from '../utils/isEip7702EOA.utils'
import { isSafeConnector } from '../utils/isSafeConnector.utils'

export const isSafeWalletAtom = atom((get): boolean | undefined => {
  const gnosisSafeInfo = get(gnosisSafeInfoAtom)

  if (gnosisSafeInfo === undefined) return undefined

  return !!gnosisSafeInfo
})

export const isSafeAppAtom = atom((get): boolean | null => {
  const { connector } = get(walletInfoAtom)

  if (!connector) return null

  return isSafeConnector(connector)
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)
  const { connector } = get(walletInfoAtom)

  // TODO: connector will be undefined on page load until the WalletUpdater kicks in. Consider replacing the updater with atom's onMount/observer.
  if (isSafeApp || connector?.type !== ConnectionType.WALLET_CONNECT_V2) return false

  const { walletName } = get(walletDetailsAtom)
  const peerName = walletName?.toLowerCase() || ''

  return peerName.includes('safe')
})

export const accountTypeAsyncAtom = atom(async (get) => {
  const { chainId, account, connector } = get(walletInfoAtom)

  if (!chainId || !account || !connector) return null
  if (!isEvmChain(chainId)) return null

  // TODO: Replace with apps/explorer/src/hooks/euler/client.ts
  const publicClient = createPublicClient({
    chain: VIEM_CHAINS[chainId],
    transport: http(RPC_URLS[chainId]),
  })

  if (!publicClient) return null

  try {
    const code = await publicClient.getCode({ address: account })

    if (!code || code === '0x') {
      return AccountType.EOA
    }

    if (isEip7702EOA(code, account)) {
      return AccountType.EIP7702EOA
    }

    return AccountType.SMART_CONTRACT
  } catch (e) {
    console.debug(`checkIsSmartContractWallet: failed to check address ${account}`, e.message)
    // If we cannot determine yet, return undefined to avoid false negatives during init
    return null
  }
})

export const accountTypeLoadableAtom = loadable(accountTypeAsyncAtom)

export const accountTypeAtom = atom((get): AccountType | null => {
  const loadable = get(accountTypeLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return null

  return loadable.data ?? null
})

export const isSmartContractWalletAtom = atom((get): boolean | undefined => {
  const accountType = get(accountTypeAtom)
  const isSafeWallet = get(isSafeWalletAtom)

  return isSafeWallet || accountType === AccountType.SMART_CONTRACT
})
