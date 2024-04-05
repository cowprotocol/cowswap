import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PermitInfo } from '@cowprotocol/permit-utils'

import { AddPermitTokenParams } from '../types'

type PermittableTokens = Record<string, PermitInfo>

/**
 * Atom that stores the permittable tokens info for each chain on localStorage.
 * It's meant to be shared across different tabs, thus no special storage handling.
 *
 * Contains the permit info for every token checked locally
 */

export const permittableTokensAtom = atomWithStorage<Record<SupportedChainId, PermittableTokens>>(
  'permittableTokens:v3',
  mapSupportedNetworks({}),
  getJotaiMergerStorage()
)

/**
 * Helper derived atom to add a permit info for a token for a given chain
 */
export const addPermitInfoForTokenAtom = atom(
  null,
  (get, set, { chainId, tokenAddress, permitInfo }: AddPermitTokenParams) => {
    const permittableTokens = { ...get(permittableTokensAtom) }

    permittableTokens[chainId][tokenAddress.toLowerCase()] = permitInfo

    set(permittableTokensAtom, permittableTokens)
  }
)
