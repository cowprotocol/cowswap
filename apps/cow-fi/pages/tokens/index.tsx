import Layout from '@/components/Layout'
import { Color } from '@cowprotocol/ui'
import styled from 'styled-components/macro'
import { getTokensInfo } from 'services/tokens'
import { TokenInfo } from 'types'
import { GetStaticProps } from 'next'
import { TokenList, TokenListProps } from '@/components/TokensList'
import { CONFIG } from '@/const/meta'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 56px auto;
  gap: 24px;
  font-size: 1.6rem;
`

export default function TokenListPage({ tokens }: { tokens: TokenInfo[] }) {
  return (
    <Layout
      metaTitle={`Tokens - ${CONFIG.title}`}
      metaDescription="Track the latest tokens price, market cap, trading volume, and more with CoW DAO's live token price tracker."
      bgColor={Color.neutral90}
    >
      <Wrapper>
        <TokenList tokens={tokens} />
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<TokenListProps> = async () => {
  const tokens = await getTokensInfo()

  return {
    props: {
      tokens,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
