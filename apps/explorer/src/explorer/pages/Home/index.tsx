import React from 'react'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { Helmet } from 'react-helmet'
import styled from 'styled-components/macro'

import { subgraphApiSDK } from '../../../cowSdk'
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
  ...mapSupportedNetworks(false), // Default to false for all networks
  [SupportedChainId.MAINNET]: true, // Only show tokens table for mainnet
}

export const Home: React.FC = () => {
  const networkId = useNetworkId() ?? undefined

  const { isTheGraphEnabled } = useFlags()

  const showCharts = !!networkId && isTheGraphEnabled && subgraphApiSDK.SUBGRAPH_PROD_CONFIG[networkId] !== null
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
