import Head from 'next/head'
import { GetStaticProps } from 'next'

import { CONFIG } from '@/const/meta'

import LayoutV2 from '@/components/Layout/LayoutV2'

const numberFormatter = Intl.NumberFormat('en', { notation: 'compact' })
const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

interface HomeLandingProps {
  siteConfigData: typeof CONFIG
}

export default function HomeLanding({ siteConfigData }: HomeLandingProps) {
  return (
    <LayoutV2>
      <Head>
        <title>
          {siteConfigData.title} - {siteConfigData.descriptionShort}
        </title>
      </Head>
    </LayoutV2>
  )
}

export const getStaticProps: GetStaticProps<HomeLandingProps> = async () => {
  const siteConfigData = CONFIG

  return {
    props: {
      siteConfigData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
