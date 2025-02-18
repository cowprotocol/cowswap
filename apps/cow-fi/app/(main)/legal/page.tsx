'use client'

import { Color } from '@cowprotocol/ui'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'
import { Link } from '@/components/Link'
import { ArticleContent, ArticleMainTitle, BodyContent, Breadcrumbs, ContainerCard } from '@/styles/styled'

const LEGAL_LINKS = [
  {
    title: 'CoW Widget Terms and Conditions',
    href: '/legal/widget-terms',
  },
  {
    title: 'CoW Swap Terms and Conditions',
    href: '/legal/cowswap-terms',
  },
  {
    title: 'CoW Swap Privacy Policy',
    href: '/legal/cowswap-privacy-policy',
  },
  {
    title: 'CoW Swap Cookie Policy',
    href: '/legal/cowswap-cookie-policy',
  },
]

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

export default function Page() {
  const analytics = useCowAnalytics()

  return (
    <Wrapper>
      <ContainerCard bgColor={Color.neutral100} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
        <ArticleContent maxWidth="100%">
          <Breadcrumbs>
            <Link
              href="/"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.LEGAL,
                  action: 'Click Breadcrumb',
                  label: 'home',
                })
              }
            >
              Home
            </Link>

            <span>CoW DAO Legal Overview</span>
          </Breadcrumbs>

          <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
            CoW DAO Legal Overview
          </ArticleMainTitle>

          <BodyContent>
            <p>An overview of all legal documents related to CoW DAO and its products.</p>

            <ul>
              {LEGAL_LINKS.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    onClick={() =>
                      analytics.sendEvent({
                        category: CowFiCategory.LEGAL,
                        action: 'Click Document',
                        label: link.title,
                      })
                    }
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </BodyContent>
        </ArticleContent>
      </ContainerCard>
    </Wrapper>
  )
}
