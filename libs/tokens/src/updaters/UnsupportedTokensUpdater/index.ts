import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useInterval } from '@cowprotocol/common-hooks'

import ms from 'ms.macro'

import { useUnsupportedTokens } from '../../hooks/tokens/unsupported/useUnsupportedTokens'
import { removeUnsupportedTokensAtom } from '../../state/tokens/unsupportedTokensAtom'

const UNSUPPORTED_TOKEN_TTL = 0 // TODO: Set to 1h after fixing race condition (see https://github.com/cowprotocol/cowswap/issues/4759)
const CHECK_EXPIRED_TOKEN_CACHE = ms('30s')

/**
 * Since an unsupported token might become supported in the future, we should periodically reset the list of unsupported tokens.
 */
export function UnsupportedTokensUpdater() {
  const removeUnsupportedTokens = useSetAtom(removeUnsupportedTokensAtom)
  const unsupportedTokens = useUnsupportedTokens()

  const resetUnsupportedTokens = useCallback(() => {
    const expiredTokens = Object.keys(unsupportedTokens).reduce<Array<string>>((acc, tokenAddress) => {
      const isExpired = Date.now() - unsupportedTokens[tokenAddress].dateAdded > UNSUPPORTED_TOKEN_TTL

      if (isExpired) {
        acc.push(tokenAddress)
      }

      return acc
    }, [])

    removeUnsupportedTokens(expiredTokens)
  }, [removeUnsupportedTokens, unsupportedTokens])

  useInterval(resetUnsupportedTokens, CHECK_EXPIRED_TOKEN_CACHE)

  return null
}
