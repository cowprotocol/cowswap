import { GetStaticProps } from 'next'
import { Color } from '@cowprotocol/ui'

import Layout from '@/components/Layout'
import { Link } from '@/components/Link'

import { PageWrapper, ContainerCard, ArticleContent, ArticleMainTitle, BodyContent } from '@/styles/styled'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { clickOnError404GoHome } from 'modules/analytics'

interface PageProps {
  siteConfigData: typeof CONFIG
}

export default function Page({ siteConfigData }: PageProps) {
  const { title } = siteConfigData

  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="404 - Page Not Found"
      metaDescription="This page could not be found. Please go back to the homepage or use the navigation menu to find what you are looking for."
    >
      <PageWrapper>
        <ContainerCard bgColor={'transparent'} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
          <ArticleContent maxWidth="90rem">
            <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
              {title}
            </ArticleMainTitle>

            <BodyContent>
              <p>
                This page could not be found. Please go back to the{' '}
                <Link href="/" onClick={clickOnError404GoHome}>
                  homepage
                </Link>{' '}
                or use the navigation menu to find what you are looking for.
              </p>
            </BodyContent>
          </ArticleContent>
        </ContainerCard>
      </PageWrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  return {
    props: {
      siteConfigData: {
        ...CONFIG,
        title: '404 - Page Not Found',
        descriptionShort: '404 - Page Not Found',
      },
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
