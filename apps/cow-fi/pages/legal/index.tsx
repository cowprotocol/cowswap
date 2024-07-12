import { GetStaticProps } from 'next'
import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import Layout from '@/components/Layout'
import { Link } from '@/components/Link'

import { ContainerCard, ArticleContent, Breadcrumbs, ArticleMainTitle, BodyContent } from '@/styles/styled'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { clickOnLegal } from 'modules/analytics'

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
  const { title, descriptionShort } = siteConfigData

  return (
    <Layout bgColor={Color.neutral90} metaTitle="Legal - CoW DAO Legal Overview" metaDescription={descriptionShort}>
      <Wrapper>
        <ContainerCard bgColor={Color.neutral100} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
          <ArticleContent maxWidth="100%">
            <Breadcrumbs>
              <Link href="/" onClick={() => clickOnLegal('click-legal-breadcrumbs')}>
                Home
              </Link>

              <span>{title}</span>
            </Breadcrumbs>

            <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
              {title}
            </ArticleMainTitle>

            <BodyContent>
              <p>An overview of all legal documents related to CoW DAO and its products.</p>

              <ul>
                {LEGAL_LINKS.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} onClick={() => clickOnLegal(`click-${link.title}`)}>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </BodyContent>
          </ArticleContent>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  return {
    props: {
      siteConfigData: {
        ...CONFIG,
        title: 'CoW DAO Legal Overview',
        descriptionShort:
          'Legal overview of CoW DAO, including terms and conditions, privacy policy, and other documents.',
      },
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
