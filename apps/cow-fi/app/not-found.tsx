'use client'

import { Color } from '@cowprotocol/ui'

import Layout from '@/components/Layout'
import { Link } from '@/components/Link'

import { PageWrapper, ContainerCard, ArticleContent, ArticleMainTitle, BodyContent } from '@/styles/styled'

import { clickOnError404GoHome } from '../modules/analytics'

export default function Page() {
  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="404 - Page Not Found"
      metaDescription="This page could not be found. Please go back to the homepage or use the navigation menu to find what you are looking for."
    >
      <title>404 - Page Not Found</title>
      <PageWrapper>
        <ContainerCard bgColor={'transparent'} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
          <ArticleContent maxWidth="90rem">
            <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
              404 - Page Not Found
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
