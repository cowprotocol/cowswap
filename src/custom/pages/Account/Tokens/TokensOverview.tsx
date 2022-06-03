import { useEffect, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { Wrapper, AccountPageWrapper, Subtitle } from '../styled'
import { AccountMenu } from '../Menu'
import { useAllTokens } from 'hooks/Tokens'
import { isTruthy } from 'utils/misc'
import { Card } from 'pages/Profile/styled'
import TokensTable from 'components/Tokens/TokensTable'

export default function TokensOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const allTokens = useAllTokens()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(isTruthy)
  }, [allTokens])

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Subtitle>
          <Trans>All tokens</Trans>
        </Subtitle>
        <Card>
          <TokensTable tokensData={formattedTokens} />
        </Card>
      </AccountPageWrapper>
    </Wrapper>
  )
}
