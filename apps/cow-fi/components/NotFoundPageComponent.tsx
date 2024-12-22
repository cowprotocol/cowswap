'use client'

import { ArticleContent, ArticleMainTitle, BodyContent, ContainerCard, PageWrapper } from '@/styles/styled'
import { Link } from '@/components/Link'
import { clickOnError404GoHome } from '../modules/analytics'

export function NotFoundPageComponent() {
  return (
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
  )
}
