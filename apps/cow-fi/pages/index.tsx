import Head from 'next/head'
import { GetStaticProps } from 'next'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'

import { getCowStats } from 'services/cow'
import Home, { HomeProps } from '@/components/Home'

const numberFormatter = Intl.NumberFormat('en', { notation: 'compact' })
const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

// Defaults are only meant to be used when the API fails
const DEFAULT_USD_VOLUME = '40400000000' // https://dune.com/cowprotocol/cowswap-high-level-metrics-dashboard?Aggregate+by_e759c2=Week

export default function HomePage({ metricsData, siteConfigData }: HomeProps) {
  return (
    <Layout fullWidthGradientVariant>
      <Head>
        <title>
          {siteConfigData.title} - {siteConfigData.descriptionShort}
        </title>
      </Head>

      <Home metricsData={metricsData} siteConfigData={siteConfigData} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const siteConfigData = CONFIG
  let volumeUsd = DEFAULT_USD_VOLUME

  // TODO: Fix this
  // // Don't fail when couldn't get Subgraph data
  // try {
  //   const data = await cowSdk.cowSubgraphApi.getTotals()
  //   volumeUsd = data.volumeUsd
  // } catch (e) {
  //   console.error('Error getting totals from Dune', e)
  // }
  const { surplus, totalTrades, lastModified } = await getCowStats()

  const totalSurplus = surplus.reasonable + surplus.unusual
  const lastModifiedFormatted = lastModified.toISOString()

  return {
    props: {
      metricsData: {
        totalVolume: numberFormatter.format(+volumeUsd) + '+',

        tradesCount: numberFormatter.format(totalTrades) + '+',
        tradesCountLastModified: lastModifiedFormatted,

        totalSurplus: numberFormatter.format(totalSurplus) + '+',
        totalSurplusLastModified: lastModifiedFormatted,
      },
      siteConfigData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
