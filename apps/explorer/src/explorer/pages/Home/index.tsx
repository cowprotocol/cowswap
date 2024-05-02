import React from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Helmet } from 'react-helmet'
import styled from 'styled-components/macro'

import { SUBGRAPH_URLS } from '../../../consts/subgraphUrls'
import { useNetworkId } from '../../../state/network'
import { media } from '../../../theme'
import { Search } from '../../components/common/Search'
import { StatsSummaryCardsWidget } from '../../components/SummaryCardsWidget'
import { TokensTableWidget } from '../../components/TokensTableWidget'
import { APP_TITLE } from '../../const'
import { Wrapper as WrapperMod } from '../styled'

const Wrapper = styled(WrapperMod)`
  max-width: 140rem;
  flex-flow: column wrap;
  justify-content: center;
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

const SHOW_TOKENS_TABLE: Record<SupportedChainId, boolean> = {
  [SupportedChainId.MAINNET]: true,
  [SupportedChainId.GNOSIS_CHAIN]: false, // Gchain data is not reliable
  [SupportedChainId.SEPOLIA]: false, // No data for Sepolia
}

export const Home: React.FC = () => {
  const networkId = useNetworkId() || undefined

  const { isTheGraphEnabled } = useFeatureFlags()

  const showCharts = !!networkId && isTheGraphEnabled && SUBGRAPH_URLS[networkId] !== null
  const showTokensTable = !!networkId && isTheGraphEnabled && SHOW_TOKENS_TABLE[networkId]

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
            {showTokensTable && <TokensTableWidget networkId={networkId} />}
          </>
        )}
      </SummaryWrapper>
    </Wrapper>
  )
}

export default Home
