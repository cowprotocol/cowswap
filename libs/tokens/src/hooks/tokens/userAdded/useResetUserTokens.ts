import { useSetAtom } from 'jotai'

import { Command } from '@cowprotocol/types'

import { resetUserTokensAtom } from '../../../state/tokens/userAddedTokensAtom'

export function useResetUserTokens(): Command {
  return useSetAtom(resetUserTokensAtom)
}
