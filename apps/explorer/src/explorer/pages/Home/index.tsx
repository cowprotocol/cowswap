import React from 'react'
import { Search } from '../../components/common/Search'
import { Wrapper as WrapperMod } from '../styled'
import styled from 'styled-components'
import { media } from '../../../theme/styles/media'
import { StatsSummaryCardsWidget } from '../../components/SummaryCardsWidget'
import { useNetworkId } from '../../../state/network'
import { TokensTableWidget } from '../../components/TokensTableWidget'
import { Helmet } from 'react-helmet'
import { APP_TITLE } from '../../const'
import { NETWORKS_WITHOUT_SUBGRAPH } from '../../../const'

const Wrapper = styled(WrapperMod)`
  max-width: 140rem;
  flex-flow: column wrap;
  justify-content: flex-start;
  display: flex;
  padding-top: 10rem;

  > h1 {
    justify-content: center;
    padding: 2.4rem 0 0.75rem;
    margin: 0 0 2.4rem;
    font-size: 2.4rem;
    line-height: 1;

    ${media.xSmallDown} {
      font-size: 1.7rem;
    }
  }
`

const SummaryWrapper = styled.section`
  display: flex;
  flex-direction: column;
  margin: 5rem 0 0 0;
  gap: 5rem;

  ${media.mobile} {
    padding-top: 4rem;
    max-width: 95vw;
  }

  ${media.xSmallDown} {
    padding-top: 3rem;
    max-width: 92vw;
  }
`

export const Home: React.FC = () => {
  const networkId = useNetworkId() || undefined

  const showCharts = !!networkId && !NETWORKS_WITHOUT_SUBGRAPH.includes(networkId)

  return (
    <Wrapper>
      <Helmet>
        <title>{APP_TITLE}</title>
      </Helmet>
      <h1>Search on CoW Protocol Explorer</h1>
      <Search className="home" />
      <SummaryWrapper>
        {showCharts && (
          <>
            <StatsSummaryCardsWidget />
            <TokensTableWidget networkId={networkId} />
          </>
        )}
      </SummaryWrapper>
    </Wrapper>
  )
}

export default Home
