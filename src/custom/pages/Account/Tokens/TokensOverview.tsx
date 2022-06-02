import { useEffect, useMemo } from 'react'
import { Wrapper, AccountPageWrapper, Subtitle, MainText, AccountCard, AccountHeading, RemoveTokens } from '../styled'
import { AccountMenu } from '../Menu'
import { useAllTokens } from 'hooks/Tokens'
import { notEmpty } from 'utils'
import TokensTable from 'components/Tokens/TokensTable'
import { useFavouriteTokens, useRemoveAllFavouriteTokens } from 'state/user/hooks'

export default function TokensOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const favouriteTokens = useFavouriteTokens()
  const allTokens = useAllTokens()

  const removeAllFavouriteTokens = useRemoveAllFavouriteTokens()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(notEmpty)
  }, [allTokens])

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <AccountHeading>
          <Subtitle>Favourite tokens</Subtitle>
          <RemoveTokens onClick={() => removeAllFavouriteTokens()}>(Clear)</RemoveTokens>
        </AccountHeading>
        <AccountCard>
          {favouriteTokens.length > 0 ? (
            <TokensTable tokensData={favouriteTokens} />
          ) : (
            <MainText>Favourite tokens will appear here</MainText>
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
