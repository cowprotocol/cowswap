'use client'

import type { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { UI } from '@cowprotocol/ui'

import { usePathname } from 'next/navigation'
import styled from 'styled-components/macro'

import { Link } from '@/components/Link'
import { ArticleContent, ArticleMainTitle, BodyContent, Breadcrumbs, ContainerCard } from '@/styles/styled'

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

interface ContentPageLayoutProps {
  title: string
  children: ReactNode
}

export function ContentPageLayout({ title, children }: ContentPageLayoutProps): ReactNode {
  const analytics = useCowAnalytics()
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    return { path, label, segment }
  })

  return (
    <Wrapper>
      <ContainerCard
        bgColor={`var(${UI.COLOR_NEUTRAL_100})`}
        minHeight="70vh"
        gap={62}
        gapMobile={42}
        centerContent
        touchFooter
      >
        <ArticleContent maxWidth="100%">
          <Breadcrumbs>
            <Link
              href="/"
              onClick={() =>
                analytics.sendEvent({
                  category: 'Navigation',
                  action: 'click-breadcrumb-home',
                })
              }
            >
              Home
            </Link>
            {breadcrumbs.slice(0, -1).map((crumb) => (
              <Link
                key={crumb.path}
                href={crumb.path}
                onClick={() =>
                  analytics.sendEvent({
                    category: 'Navigation',
                    action: `click-breadcrumb-${crumb.segment}`,
                  })
                }
              >
                {crumb.label}
              </Link>
            ))}
            <span>{title}</span>
          </Breadcrumbs>

          <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
            {title}
          </ArticleMainTitle>

          <BodyContent>{children}</BodyContent>
        </ArticleContent>
      </ContainerCard>
    </Wrapper>
  )
}
