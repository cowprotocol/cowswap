import { useAtomValue } from 'jotai'

import type { Signer } from '@cowprotocol/cow-sdk'

import { appSignerAtom } from 'cowSdk'

/**
 * Returns the signer from the global ViemAdapter instance set by CowSdkUpdater.
 * Available once a wallet with an EVM account has connected; a Solana-only connection leaves it
 * holding whatever the last EVM connection set.
 */
export function useAppSigner(): Signer | undefined {
  return useAtomValue(appSignerAtom)
}
