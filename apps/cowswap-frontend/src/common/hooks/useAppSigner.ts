import { useAtomValue } from 'jotai'

import { areAddressesEqual, type Signer } from '@cowprotocol/cow-sdk'

import { appSignerAccountAtom, appSignerAtom } from 'cowSdk'
import { Nullish } from 'types'

/**
 * Returns the signer from the global ViemAdapter instance set by CowSdkUpdater.
 * Available when a wallet is connected (walletClient is present).
 */
export function useAppSigner(): Signer | undefined {
  return useAtomValue(appSignerAtom)
}

/**
 * Returns the app signer only when it signs for `account`.
 * Undefined while the wallet client is still restoring or still belongs to the previous account.
 */
export function useAppSignerForAccount(account: Nullish<string>): Signer | undefined {
  const signer = useAtomValue(appSignerAtom)
  const signerAccount = useAtomValue(appSignerAccountAtom)

  return account && areAddressesEqual(signerAccount, account) ? signer : undefined
}
