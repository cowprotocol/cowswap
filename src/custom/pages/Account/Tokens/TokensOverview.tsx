import { useEffect, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { Wrapper, AccountPageWrapper, Subtitle, MainText, AccountCard, AccountHeading, RemoveTokens } from './styled'
import { AccountMenu } from '../Menu'
import { useAllTokens } from 'hooks/Tokens'
import { isTruthy } from 'utils/misc'
import TokensTable from 'components/Tokens/TokensTable'
import { useFavouriteTokens, useRemoveAllFavouriteTokens } from 'state/user/hooks'
import { useAllTokenBalances } from 'state/wallet/hooks'

const FAVOURITE_TABLE_LOADING_ROWS = 4

export default function TokensOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const balances = useAllTokenBalances()

  const removeAllFavouriteTokens = useRemoveAllFavouriteTokens()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(isTruthy)
  }, [allTokens])

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <AccountHeading>
          <Subtitle>
            <Trans>Favourite tokens</Trans>
          </Subtitle>
          <RemoveTokens onClick={() => removeAllFavouriteTokens()}>
            (<Trans>Restore defaults</Trans>)
          </RemoveTokens>
        </AccountHeading>
        <AccountCard>
          {favouriteTokens.length > 0 ? (
            <TokensTable loadingRows={FAVOURITE_TABLE_LOADING_ROWS} balances={balances} tokensData={favouriteTokens} />
          ) : (
            <MainText>
              <Trans>Favourite tokens will appear here</Trans>
            </MainText>
          )}
        </AccountCard>

        <AccountHeading>
          <Subtitle>
            <Trans>All tokens</Trans>
          </Subtitle>
        </AccountHeading>
        <AccountCard>
          <TokensTable balances={balances} tokensData={formattedTokens} />
        </AccountCard>
      </AccountPageWrapper>
    </Wrapper>
  )
}
