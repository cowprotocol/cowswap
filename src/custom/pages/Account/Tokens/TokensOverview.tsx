import { useEffect, useMemo } from 'react'
import { Wrapper, AccountPageWrapper, Subtitle, MainText, AccountCard, AccountHeading, RemoveTokens } from '../styled'
import { AccountMenu } from '../Menu'
import { useAllTokens } from 'hooks/Tokens'
import { notEmpty } from 'utils'
import TokensTable from 'components/Tokens/TokensTable'
import { useSavedTokens, useRemoveAllSavedTokens } from 'state/user/hooks'

export default function TokensOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const savedTokens = useSavedTokens()
  const allTokens = useAllTokens()

  const removeAllSavedTokens = useRemoveAllSavedTokens()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(notEmpty)
  }, [allTokens])

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <AccountHeading>
          <Subtitle>Saved tokens</Subtitle>
          <RemoveTokens onClick={() => removeAllSavedTokens()}>(Clear)</RemoveTokens>
        </AccountHeading>
        <AccountCard>
          {savedTokens.length > 0 ? (
            <TokensTable tokensData={savedTokens} />
          ) : (
            <MainText>Saved tokens will appear here</MainText>
          )}
        </AccountCard>

        <AccountHeading>
          <Subtitle>All tokens</Subtitle>
        </AccountHeading>
        <AccountCard>
          <TokensTable tokensData={formattedTokens} />
        </AccountCard>
      </AccountPageWrapper>
    </Wrapper>
  )
}
