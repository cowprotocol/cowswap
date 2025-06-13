import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { Helmet } from 'react-helmet'
import styled from 'styled-components/macro'

import { SUBGRAPH_URLS } from '../../../consts/subgraphUrls'
import { useNetworkId } from '../../../state/network'
import { Search } from '../../components/common/Search'
import { StatsSummaryCardsWidget } from '../../components/SummaryCardsWidget'
import { TokensTableWidget } from '../../components/TokensTableWidget'
import { APP_TITLE } from '../../const'
import { Wrapper as WrapperMod } from '../styled'

const Wrapper = styled(WrapperMod)`
  max-width: 100%;
  height: calc(100vh - 10rem);
  flex-flow: column wrap;
  justify-content: center;
  display: flex;
  padding: 0;

  ${Media.upToMedium()} {
    height: 50vh;
  }

  ${Media.upToSmall()} {
    padding: 0 1.6rem;
  }

  > h1 {
    justify-content: center;
    padding: 2.4rem 0 0.75rem;
    margin: 0 0 2.4rem;
    font-size: 2.4rem;
    line-height: 1;

    ${Media.upToExtraSmall()} {
      font-size: 1.7rem;
    }
  }
`

const SummaryWrapper = styled.section`
  display: flex;
  flex-direction: column;
  margin: 5rem 0 0 0;
  gap: 5rem;

  ${Media.upToSmall()} {
    padding-top: 4rem;
    max-width: 95vw;
  }

  ${Media.upToExtraSmall()} {
    padding-top: 3rem;
    max-width: 92vw;
  }
`

const SHOW_TOKENS_TABLE: Record<SupportedChainId, boolean> = {
  [SupportedChainId.MAINNET]: true,
  [SupportedChainId.GNOSIS_CHAIN]: false, // Gchain data is not reliable
  [SupportedChainId.ARBITRUM_ONE]: false, // No data for Arbitrum one
  [SupportedChainId.BASE]: false, // No data for Base
  [SupportedChainId.SEPOLIA]: false, // No data for Sepolia
  [SupportedChainId.POLYGON]: false, // No data for Polygon
  [SupportedChainId.AVALANCHE]: false, // No data for Avalanche
}

export const Home: React.FC = () => {
  const networkId = useNetworkId() ?? undefined

  const { isTheGraphEnabled } = useFlags()

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
