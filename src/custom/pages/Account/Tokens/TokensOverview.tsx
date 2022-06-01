import { useEffect, useMemo } from 'react'
import { Wrapper, AccountPageWrapper, Subtitle, MainText, AccountCard } from '../styled'
import { AccountMenu } from '../Menu'
import { useAllTokens } from 'hooks/Tokens'
import { notEmpty } from 'utils'
import TokensTable from 'components/Tokens/TokensTable'
import { useSavedTokens } from 'state/user/hooks'

export default function TokensOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const savedTokens = useSavedTokens()
  const allTokens = useAllTokens()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(notEmpty)
  }, [allTokens])

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Subtitle>Saved tokens</Subtitle>
        <AccountCard>
          {savedTokens.length > 0 ? (
            <TokensTable tokensData={savedTokens} />
          ) : (
            <MainText>Saved tokens will appear here</MainText>
          )}
        </AccountCard>

        <Subtitle>All tokens</Subtitle>
        <AccountCard>
          <TokensTable tokensData={formattedTokens} />
        </AccountCard>
      </AccountPageWrapper>
    </Wrapper>
  )
}
