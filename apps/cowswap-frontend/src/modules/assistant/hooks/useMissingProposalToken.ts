import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useAddUserToken, useSearchToken, useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { LandedStatus } from './useProposalLanded'

import { AssistantProposal } from '../types'

export interface MissingProposalToken {
  /** What the chain says is at that address. */
  token: TokenWithLogo
  /** Add it to the user's tokens so the form can use it. */
  add(): void
}

/**
 * The proposal's token that the form can't show, and a way to add it.
 *
 * A trade naming a token outside the enabled lists loads only half — the sell side
 * arrives and the buy side stays "Select a token" — because the form has nothing to
 * resolve the address to. That reads as the assistant failing at a trade it in fact
 * set up correctly.
 *
 * The remedy was already documented in the prompt: open the token selector, paste
 * the address, press Import. Describing four steps someone can do in one is a poor
 * substitute for doing it, and the app's own pieces are right here —
 * `useSearchToken` reads the token off-chain by address, `useAddUserToken` adds it.
 *
 * ⚠️ **Found, not imported.** This returns what the chain reports and an `add` for
 * the person to press. Importing silently would put a token nobody has looked at
 * into the form, and "I can't verify this is the token you think it is" is exactly
 * the caveat the paste flow carries — so the symbol and address go on the button,
 * where they can be read before anything happens.
 */
export function useMissingProposalToken(
  proposal: AssistantProposal | null,
  landed: LandedStatus,
): MissingProposalToken | null {
  const { chainId } = useWalletInfo()
  const tokensByAddress = useTokensByAddressMap()
  const addUserToken = useAddUserToken()

  // Only meaningful once the form has had its chance and one side is still absent,
  // and only on the chain the proposal is for — a token map for another chain says
  // nothing about this address.
  const missingAddress = useMemo(() => {
    if (!proposal || landed === 'landed' || proposal.chainId !== chainId) return null

    return (
      [proposal.sellToken, proposal.buyToken].find(
        (id) => /^0x[a-fA-F0-9]{40}$/.test(id) && !tokensByAddress[getAddressKey(id)],
      ) ?? null
    )
  }, [chainId, landed, proposal, tokensByAddress])

  const { blockchainResult, externalApiResult, inactiveListsResult } = useSearchToken(missingAddress)

  // The chain is the authority on what's at an address; the others are how it gets
  // a name and a logo when someone has catalogued it.
  const token = missingAddress ? (blockchainResult[0] ?? externalApiResult[0] ?? inactiveListsResult[0] ?? null) : null

  const add = useCallback(() => {
    if (token) addUserToken([token])
  }, [addUserToken, token])

  return token ? { token, add } : null
}
