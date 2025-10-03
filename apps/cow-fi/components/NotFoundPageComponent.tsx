'use client'

import type { ReactElement } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Media } from '@cowprotocol/ui'

import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'

import { Link } from '@/components/Link'
import { ArticleContent, ArticleMainTitle, BodyContent, ContainerCard, PageWrapper } from '@/styles/styled'

const Content = styled(ArticleContent)`
  position: relative;
  z-index: 1;

  ${Media.upToMedium()} {
    text-align: center;
  }
`

export function NotFoundPageComponent(): ReactElement {
  const analytics = useCowAnalytics()

  return (
    <PageWrapper>
      <ContainerCard bgColor="transparent" gap={62} gapMobile={42} centerContent>
        <Content maxWidth="90rem">
          <ArticleMainTitle margin="0 0 62px" fontSize={52}>
            404 - Page Not Found
          </ArticleMainTitle>

          <BodyContent>
            <p>
              This page could not be found. Please go back to the{' '}
              <Link
                href="/"
                onClick={() =>
                  analytics.sendEvent({
                    category: CowFiCategory.ERROR404,
                    action: 'Click Home',
                    label: '404-page',
                  })
                }
              >
                homepage
              </Link>{' '}
              or use the navigation menu to find what you are looking for.
            </p>
          </BodyContent>
        </Content>
      </ContainerCard>
    </PageWrapper>
  )
}
