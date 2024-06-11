import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Font, Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'
import { getCategories, getArticles, Category, ArticleListResponse } from 'services/cms'

import { SearchBar } from '@/components/SearchBar'
import { ArrowButton } from '@/components/ArrowButton'

import {
  ContainerCard,
  ContainerCardSection,
  ContainerCardSectionTop,
  ArticleList,
  ArticleCard,
  ArticleImage,
  ArticleTitle,
  ArticleDescription,
  TopicList,
  TopicCard,
  TopicImage,
  LinkSection,
  LinkColumn,
  LinkItem,
  CTASectionWrapper,
  CTAImage,
  CTASubtitle,
  CTATitle,
  CTAButton,
  ContainerCardSectionTopTitle,
} from '@/styles/styled'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

const FEATURED_ARTICLES = [
  {
    title: 'What is a Sandwich Attack? — MEV Attacks Explained',
    description: 'Sandwich attacks make up the majority of harmful MEV extraction',
    color: '#0B6623',
    link: '/learn/sandwich-attack',
    linkExternal: false,
  },
  {
    title: 'What is a Smart Contract?',
    description:
      'Smart Contracts enable the majority of decentralized apps and are critical to modern blockchain ecosystems',
    color: '#FFD700',
    link: '/learn/smart-contract',
    linkExternal: false,
  },
  {
    title: 'CoW DAO April 2024 Highlights',
    description:
      'Welcome back to CoW DAO highlights, where we break down the most notable developments of the last few weeks at CoW DAO.',
    color: '#FF69B4',
    link: '/learn/cow-dao-april-2024',
    linkExternal: false,
  },
  {
    title: 'What is a Sandwich Attack? — MEV Attacks Explained',
    description: 'Sandwich attacks make up the majority of harmful MEV extraction',
    color: '#800020',
    link: '/learn/sandwich-attack',
    linkExternal: false,
  },
  {
    title: 'What is a Smart Contract?',
    description:
      'Smart Contracts enable the majority of decentralized apps and are critical to modern blockchain ecosystems',
    color: '#00BFFF',
    link: '/learn/smart-contract',
    linkExternal: false,
  },
  {
    title: 'CoW DAO April 2024 Highlights',
    description:
      'Welcome back to CoW DAO highlights, where we break down the most notable developments of the last few weeks at CoW DAO.',
    color: '#FF4500',
    link: '/learn/cow-dao-april-2024',
    linkExternal: false,
  },
]

const PODCASTS = [
  { title: 'CoW Hooks: you are in control!', link: '/podcast/cow-hooks' },
  { title: 'CoW Swap for DAOs', link: '/podcast/cow-swap-for-daos' },
  { title: 'Introducing surplus-capturing limit orders', link: '/podcast/surplus-limit-orders' },
  { title: 'Tally Recipes for CoW Swaps', link: '/podcast/tally-recipes' },
]

const SPACES = [
  { title: 'CoW Swap Introduces “I’m Feeling Lucky” Mode for DeFi Trades', link: '/space/feeling-lucky' },
  { title: 'CoW Protocol February 2024 Highlights', link: '/space/feb-2024-highlights' },
  { title: 'How to Add Custom Tokens on CoW Swap', link: '/space/custom-tokens' },
  { title: 'What is Loss-Versus-Rebalancing (LVR)?', link: '/space/lvr' },
]

const MEDIA_COVERAGE = [
  {
    title: 'CoW DAO unveils AMM aimed at protecting liquidity',
    publisher: 'The Block',
    image: '/path/to/image1.png',
    link: '/media/amm-liquidity',
    linkExternal: true,
  },
  {
    title: 'Ethereum projects unite to protect users from MEV-induced high prices',
    publisher: 'Cointelegraph',
    image: '/path/to/image2.png',
    link: '/media/mev-protection',
    linkExternal: true,
  },
  {
    title: 'MEV Blocker Wants to Help You Outrun the Front-Runners',
    publisher: 'Coindesk',
    image: '/path/to/image3.png',
    link: '/media/mev-blocker',
    linkExternal: true,
  },
  {
    title: 'Vitalik Buterin Sells MKR Tokens as MakerDAO Co-Founder Pushes for Solana-based ‘NewChain’',
    publisher: 'Decrypt',
    image: '/path/to/image4.png',
    link: '/media/vitalik-sells-mkr',
    linkExternal: true,
  },
]

interface LearnProps {
  siteConfigData: typeof CONFIG
  categories: {
    name: string
    slug: string
    description: string
    bgColor: string
    textColor: string
    link: string
    iconColor: string
  }[]
  articles: ArticleListResponse['data']
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1600px;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;

  h1 {
    font-size: 28px;
    font-weight: ${Font.weight.medium};
    color: ${Color.neutral50};
    text-align: center;

    ${Media.upToMedium()} {
      font-size: 18px;
    }
  }

  h2 {
    font-size: 67px;
    text-align: center;

    ${Media.upToMedium()} {
      font-size: 38px;
    }
  }
`

export default function Learn({ siteConfigData, categories, articles }: LearnProps) {
  return (
    <Layout>
      <Head>
        <title>
          {siteConfigData.title} - {siteConfigData.descriptionShort}
        </title>
      </Head>

      <Wrapper>
        <h1>Learn - Knowledge Base</h1>
        <h2>Hi, how can we help?</h2>

        <SearchBar articles={articles} />

        <ContainerCard>
          <ContainerCardSection>
            <ContainerCardSectionTop>
              <ContainerCardSectionTopTitle>Featured articles</ContainerCardSectionTopTitle>
            </ContainerCardSectionTop>
            <ArticleList>
              {FEATURED_ARTICLES.map(({ title, description, color, link, linkExternal }, index) => (
                <ArticleCard
                  key={index}
                  href={link}
                  target={linkExternal ? '_blank' : '_self'}
                  rel={linkExternal ? 'noopener' : ''}
                >
                  <ArticleImage color={color}></ArticleImage>
                  <ArticleTitle>{title}</ArticleTitle>
                  <ArticleDescription>{description}</ArticleDescription>
                </ArticleCard>
              ))}
            </ArticleList>
          </ContainerCardSection>

          <ContainerCardSection>
            <ContainerCardSectionTop>
              <ContainerCardSectionTopTitle>Topics</ContainerCardSectionTopTitle>
            </ContainerCardSectionTop>
            <TopicList columns={3}>
              {categories.map(({ name, bgColor, textColor, iconColor, link }, index) => (
                <TopicCard key={index} bgColor={bgColor} textColor={textColor} href={link}>
                  <TopicImage iconColor={iconColor}></TopicImage>
                  <h5>{name}</h5>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>

          <ContainerCardSection>
            <ContainerCardSectionTop>
              <ContainerCardSectionTopTitle>Podcasts & Spaces</ContainerCardSectionTopTitle>
            </ContainerCardSectionTop>
            <LinkSection>
              <LinkColumn>
                <h5>Podcasts</h5>
                {PODCASTS.map((podcast, index) => (
                  <LinkItem key={index} href={podcast.link}>
                    {podcast.title}
                    <span>→</span>
                  </LinkItem>
                ))}
              </LinkColumn>

              <LinkColumn>
                <h5>Spaces</h5>
                {SPACES.map((space, index) => (
                  <LinkItem key={index} href={space.link}>
                    {space.title}
                    <span>→</span>
                  </LinkItem>
                ))}
              </LinkColumn>
            </LinkSection>
          </ContainerCardSection>

          <ContainerCardSection>
            <ContainerCardSectionTop>
              <ContainerCardSectionTopTitle>Media coverage</ContainerCardSectionTopTitle>
            </ContainerCardSectionTop>
            <ArticleList columns={4}>
              {MEDIA_COVERAGE.map(({ image, title, publisher, link, linkExternal }, index) => (
                <ArticleCard
                  key={index}
                  href={link}
                  target={linkExternal ? '_blank' : '_self'}
                  rel={linkExternal ? 'noopener' : ''}
                >
                  <ArticleImage>{image && <img src={image} alt={title} />}</ArticleImage>
                  <ArticleTitle>{title}</ArticleTitle>
                  <ArticleDescription>Published by {publisher}</ArticleDescription>
                </ArticleCard>
              ))}
            </ArticleList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral98} touchFooter>
          <CTASectionWrapper>
            <CTAImage bgColor={'#00A1FF'}></CTAImage>
            <CTASubtitle>Explore, learn, integrate</CTASubtitle>
            <CTATitle>CoW DAO documentation</CTATitle>
            <CTAButton href="https://docs.cow.fi/" target="_blank" rel="noopener noreferrer">
              Read the docs
            </CTAButton>
          </CTASectionWrapper>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}
export const getStaticProps: GetStaticProps<LearnProps> = async () => {
  const siteConfigData = CONFIG
  const categoriesResponse = await getCategories()
  const articlesResponse = await getArticles()

  const categories =
    categoriesResponse?.map((category: Category) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
      description: category?.attributes?.description || '',
      bgColor: category?.attributes?.backgroundColor || '#fff',
      textColor: category?.attributes?.textColor || '#000',
      link: `/learn/topic/${category?.attributes?.slug}`,
      iconColor: '#fff',
    })) || []

  return {
    props: {
      siteConfigData,
      categories,
      articles: articlesResponse.data,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
