import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { tokensByAddressAtom } from '../../state/tokens/allTokensAtom'
import { removeUserTokensAtom, userAddedTokensAtom } from '../../state/tokens/userAddedTokensAtom'

export function UserAddedTokensUpdater() {
  const removeUserTokens = useSetAtom(removeUserTokensAtom)
  const { tokens: tokensByAddress, chainId } = useAtomValue(tokensByAddressAtom)
  const userAddedTokens = useAtomValue(userAddedTokensAtom)[chainId]

  const existingTokens = userAddedTokens
    ? Object.keys(userAddedTokens).filter((tokenAddress) => {
        return !!tokensByAddress[tokenAddress.toLowerCase()]
      })
    : undefined

  useEffect(() => {
    if (!existingTokens?.length) return

    console.log('Removing user added tokens that already in token lists:', existingTokens)
    removeUserTokens(existingTokens)
  }, [existingTokens, removeUserTokens])

  return null
}
