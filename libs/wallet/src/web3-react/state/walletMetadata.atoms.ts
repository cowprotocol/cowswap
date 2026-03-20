import { atom } from 'jotai'

import { GnosisSafe } from '@web3-react/gnosis-safe'

import { gnosisSafeInfoAtom, walletInfoAtom } from '../../api/state'

export const safeAppSdkAtom = atom((get) => {
  const { account, legacyConnector } = get(walletInfoAtom)

  return !account || !(legacyConnector instanceof GnosisSafe) || !legacyConnector.sdk ? null : legacyConnector.sdk
})

export const isSafeAppAtom = atom((get) => {
  const isSafeWallet = get(gnosisSafeInfoAtom)
  const sdk = get(safeAppSdkAtom)

  // If the wallet is not a Safe, or we don't have access to the SafeAppsSDK, we know is not a Safe App
  if (!isSafeWallet || !sdk) {
    return false
  }

  // Will only be a SafeApp if within an iframe
  // Which means, window.parent is different than window
  return window?.parent !== window
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)
  const isSafeWallet = get(gnosisSafeInfoAtom)

  return isSafeWallet && !isSafeApp
})
