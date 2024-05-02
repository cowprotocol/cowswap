import Layout from '@/components/Layout'
import { getTokensInfo } from 'services/tokens'
import { TokenInfo } from 'types'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { TokenList, TokenListProps } from '@/components/TokensList'
import { CONFIG } from '@/const/meta'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes

export default function TokenListPage({ tokens }: { tokens: TokenInfo[] }) {
  return (
    <>
      <Head>
        <title>Tokens - {CONFIG.title}</title>
      </Head>
      <Layout fullWidthGradientVariant={true}>
        <TokenList tokens={tokens} />
      </Layout>
    </>
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
