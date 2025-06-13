import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useInterval } from '@cowprotocol/common-hooks'

import ms from 'ms.macro'

import { useUnsupportedTokens } from '../../hooks/tokens/unsupported/useUnsupportedTokens'
import { removeUnsupportedTokensAtom } from '../../state/tokens/unsupportedTokensAtom'

const UNSUPPORTED_TOKEN_TTL = ms`1h`

/**
 * Since an unsupported token might become supported in the future, we should periodically reset the list of unsupported tokens.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

  useInterval(resetUnsupportedTokens, UNSUPPORTED_TOKEN_TTL)

  return null
}
