import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Color } from '@cowprotocol/ui'
import styled from 'styled-components'
import { CONFIG } from '@/const/meta'
import Layout from '@/components/Layout'
import { Link } from '@/components/Link'

import { ContainerCard, ArticleContent, ArticleMainTitle, BodyContent } from '@/styles/styled'

import { GAEventCategories } from 'lib/analytics/GAEvents'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

interface PageProps {
  siteConfigData: typeof CONFIG
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 24px auto 0;
  gap: 24px;
`

export default function Page({ siteConfigData }: PageProps) {
  const { title } = siteConfigData

  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="404 - Page Not Found"
      metaDescription="This page could not be found. Please go back to the homepage or use the navigation menu to find what you are looking for."
    >
      <Wrapper>
        <ContainerCard bgColor={'transparent'} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
          <ArticleContent maxWidth="100%">
            <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
              {title}
            </ArticleMainTitle>

            <BodyContent>
              <p>
                This page could not be found. Please go back to the{' '}
                <Link href="/" onClick={() => sendGAEventHandler(GAEventCategories.ERROR404, 'click-homepage')}>
                  homepage
                </Link>{' '}
                or use the navigation menu to find what you are looking for.
              </p>
            </BodyContent>
          </ArticleContent>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const siteConfigData = CONFIG

  return {
    props: {
      siteConfigData: {
        ...siteConfigData,
        title: '404 - Page Not Found',
        descriptionShort: '404 - Page Not Found',
      },
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
