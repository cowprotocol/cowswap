import { useCallback, useMemo } from 'react'
import { Token } from '@uniswap/sdk-core'
import { useSavedTokens, useToggleSavedToken } from 'state/user/hooks'
import { ButtonStar } from 'components/Button'

type SavedTokenButtonParams = {
  tokenData: Token
}

export default function SavedTokenButton({ tokenData }: SavedTokenButtonParams) {
  const savedTokens = useSavedTokens()

  const toggleSavedToken = useToggleSavedToken()

  const handleSavedToken = useCallback(
    (event) => {
      event.preventDefault()
      toggleSavedToken(tokenData)
    },
    [toggleSavedToken, tokenData]
  )

  const isSavedToken = useMemo(
    () => savedTokens.some((t: Token) => t.address === tokenData.address),
    [savedTokens, tokenData]
  )

  return <ButtonStar fill={isSavedToken} onClick={handleSavedToken} />
}
