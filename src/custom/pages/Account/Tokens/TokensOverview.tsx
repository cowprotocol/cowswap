import { useEffect, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { Wrapper, AccountPageWrapper, Subtitle, MainText, AccountCard, AccountHeading, RemoveTokens } from '../styled'
import { useSavedTokens, useRemoveAllSavedTokens } from '@src/state/user/hooks'
import { AccountMenu } from '../Menu'
import { useAllTokens } from 'hooks/Tokens'
import { isTruthy } from 'utils/misc'
import TokensTable from 'components/Tokens/TokensTable'

export default function TokensOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const savedTokens = useSavedTokens()
  const allTokens = useAllTokens()

  const removeAllSavedTokens = useRemoveAllSavedTokens()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(isTruthy)
  }, [allTokens])

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <AccountHeading>
          <Subtitle>Saved tokens</Subtitle>
          <RemoveTokens onClick={() => removeAllSavedTokens()}>
            (<Trans>Clear</Trans>)
          </RemoveTokens>
        </AccountHeading>
        <AccountCard>
          {savedTokens.length > 0 ? (
            <TokensTable tokensData={savedTokens} />
          ) : (
            <MainText>
              <Trans>Saved tokens will appear here</Trans>
            </MainText>
          )}
        </AccountCard>

        <AccountHeading>
          <Subtitle>
            <Trans>All tokens</Trans>
          </Subtitle>
        </AccountHeading>
        <AccountCard>
          <TokensTable tokensData={formattedTokens} />
        </AccountCard>
      </AccountPageWrapper>
    </Wrapper>
  )
}
