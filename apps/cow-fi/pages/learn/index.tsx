import Layout from '@/components/Layout'
import { GetStaticProps } from 'next'
import Head from 'next/head'

import { Button, ButtonVariant, ButtonWrapper } from '@/components/Button'
import {
  Section,
  SectionContent,
  SubTitle,
  SectionImage,
} from '@/components/Home/index.styles'

import { CONFIG } from '@/const/meta'
import { Color } from '@/styles/variables'
import { Article, Category, getArticles, getCategories } from 'services/cms'
import { ArticleList } from '@/components/Article'

import { IMAGE_PATH } from '@/const/paths'
import SocialList from '@/components/SocialList'
import { LinkWithUtm } from 'modules/utm'
import { CategoryList } from '@/components/Category'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes

export interface LearnProps {
  categories: Category[]
  articles: Article[]
}

export default function LearnPage({ categories, articles }: LearnProps) {
  return (    
    <Layout fullWidthGradientVariant={true}>
      <Head>
        <title>Learn - {CONFIG.title}</title>
      </Head>
      <Section fullWidth padding="0 8rem 14rem 8rem">
        <SectionContent flow="column">
          <div className="container">
            <h3>Learn</h3>
            <SubTitle color={Color.text1} lineHeight={1.4} maxWidth={70}>
              Read the latest articles about this vibrant ecosystem.
            </SubTitle>

            <CategoryList categories={categories} />
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth colorVariant={'dark-gradient'} flow="column" gap={14}>
        <SectionContent flow={'row'} maxWidth={100} textAlign={'left'}>
          <div className="container">
            <h3>Show me the code!</h3>
            <SubTitle lineHeight={1.4} textAlign={'left'}>
              If you are developer who likes to learn by doing, here is great place to start!
            </SubTitle>
            
            <ButtonWrapper>
              <Button href="https://learn.cow.fi" target='_blank' rel="noopener nofollow" paddingLR={4.2} fontSizeMobile={2.1} label="Interactive tutorials" />

              <LinkWithUtm
                href={CONFIG.url.docs}
                defaultUtm={{ ...CONFIG.utm, utmContent: 'learn-page-readdocs-cta-hero' }}
                passHref
              >
                <Button
                  target="_blank"
                  rel="noopener nofollow"
                  paddingLR={4.2}
                  fontSizeMobile={2.1}
                  label="Read docs"
                  variant={ButtonVariant.TEXT_LIGHT}
                />
              </LinkWithUtm>
            </ButtonWrapper>
            
          </div>
          <SectionImage>
          <img src={`${IMAGE_PATH}/eth-blocks.svg`} alt="Integrate With Ease" width="340" height="214" />
          </SectionImage>
        </SectionContent>        
      </Section>

      <Section fullWidth colorVariant={'white'} flow="column" gap={14}>
        <SectionContent flow={'row'} maxWidth={100} textAlign={'left'}>
        <div className="container">
            <h3>Latest articles</h3>
            <SubTitle lineHeight={1.4} textAlign={'left'}>
              Every week we publish new articles about CoW DAO ecosystem. Stay tuned!
            </SubTitle>

            <ArticleList articles={articles} />
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth>
        <SectionContent flow={'column'}>
          <div>
            <h3>Get in touch</h3>
            <SubTitle maxWidth={60} color={Color.text1} lineHeight={1.4}>
              You would like to suggest or even make your own article, reach out on Twitter or Discord!
            </SubTitle>
            <SocialList social={CONFIG.social} color={Color.darkBlue} />
          </div>
        </SectionContent>
      </Section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<LearnProps> = async () => {
  const articles = await getArticles()
  const categories = await getCategories()

  return {
    props: {
      articles,
      categories,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
