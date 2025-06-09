import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { environmentAtom } from '../../state/environmentAtom'
import { activeTokensMapAtom } from '../../state/tokens/allTokensAtom'
import { removeUserTokensAtom, userAddedTokensAtom } from '../../state/tokens/userAddedTokensAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UserAddedTokensUpdater() {
  const { chainId } = useAtomValue(environmentAtom)
  const removeUserTokens = useSetAtom(removeUserTokensAtom)
  const activeTokensMap = useAtomValue(activeTokensMapAtom)
  const userAddedTokens = useAtomValue(userAddedTokensAtom)[chainId]

  const existingTokens = userAddedTokens
    ? Object.keys(userAddedTokens).filter((tokenAddress) => {
        return !!activeTokensMap[tokenAddress.toLowerCase()]
      })
    : undefined

  useEffect(() => {
    if (!existingTokens?.length) return

    console.log('Removing user added tokens that already in token lists:', existingTokens)
    removeUserTokens(existingTokens)
  }, [existingTokens, removeUserTokens])

  return null
}
