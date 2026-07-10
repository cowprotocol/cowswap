import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { isEvmChain } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType } from '../../api/types'
import { getPublicClient } from '../utils/getPublicClient.utils'
import { isEip7702EOA } from '../utils/isEip7702EOA.utils'
import { isSafeConnector } from '../utils/isSafeConnector.utils'

export const isSafeWalletAtom = atom((get): boolean => {
  return !!get(gnosisSafeInfoAtom)
})

export const isSafeAppAtom = atom((get): boolean | null => {
  const { connector } = get(walletInfoAtom)

  if (!connector) return null

  return isSafeConnector(connector)
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)

  // Still loading:
  if (isSafeApp === null) return null

  // isSafeAppAtom is boolean | null — null means connector not ready yet, not a Safe App.
  if (isSafeApp) return false

  const { connector } = get(walletInfoAtom)

  // TODO: connector will be undefined on page load until the WalletUpdater kicks in. Consider replacing the updater with atom's onMount/observer.
  if (!connector) return null

  if (isSafeApp || connector.type !== ConnectionType.WALLET_CONNECT_V2) return false

  if (get(isSafeWalletAtom)) return true

  const { walletName } = get(walletDetailsAtom)
  const peerName = walletName?.toLowerCase() || ''

  return peerName.includes('safe')
})

export const accountTypeAsyncAtom = atom(async (get) => {
  const { chainId, account, connector } = get(walletInfoAtom)

  if (!chainId || !account || !connector) return null
  if (!isEvmChain(chainId)) return null

  const publicClient = getPublicClient(chainId)

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

export const isSmartContractWalletAtom = atom((get): boolean | null => {
  const accountType = get(accountTypeAtom)

  if (accountType === null) return null

  return get(isSafeWalletAtom) || accountType === AccountType.SMART_CONTRACT
})
