import { useSetAtom } from 'jotai'
import { resetUserTokensAtom } from '../../../state/tokens/userAddedTokensAtom'
import { Command } from '@cowprotocol/types'

export function useResetUserTokens(): Command {
  return useSetAtom(resetUserTokensAtom)
}
