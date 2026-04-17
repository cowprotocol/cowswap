import { useAtomValue } from 'jotai'

import type { Signer } from '@cowprotocol/cow-sdk'

import { appSignerAtom } from 'cowSdk'

/**
 * Returns the signer from the global ViemAdapter instance set by CowSdkUpdater.
 * Available when a wallet is connected (walletClient is present).
 */
export function useAppSigner(): Signer | undefined {
  return useAtomValue(appSignerAtom)
}
