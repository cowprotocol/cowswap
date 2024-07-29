import { Color, Font, Media } from '@cowprotocol/ui'
import { GetStaticProps } from 'next'

import styled from 'styled-components/macro'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'

import Layout from '@/components/Layout'
import { ArticleListResponse, getArticles, getCategories } from 'services/cms'

import { ArrowButton } from '@/components/ArrowButton'
import { SearchBar } from '@/components/SearchBar'

import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'

import {
  ArticleCard,
  ArticleDescription,
  ArticleImage,
  ArticleList,
  ArticleTitle,
  CTAButton,
  CTAImage,
  CTASectionWrapper,
  CTASubtitle,
  CTATitle,
  CategoryLinks,
  ContainerCard,
  ContainerCardInner,
  ContainerCardSection,
  ContainerCardSectionTop,
  ContainerCardSectionTopTitle,
  LinkColumn,
  LinkItem,
  LinkSection,
  TopicCard,
  TopicImage,
  TopicList,
  TopicTitle,
} from '@/styles/styled'

import { clickOnKnowledgeBase } from 'modules/analytics'
import SVG from 'react-inlinesvg'

import { CmsImage } from '@cowprotocol/ui'

const PODCASTS = [
  {
    title: 'How CoWs Will Save DeFi Swaps (0xResearch) ',
    link: 'https://www.youtube.com/watch?v=-CrTF4RO0Ww',
  },
  {
    title: 'A Deep dive into Batch Auctions (Bell Curve)',
    link: 'https://open.spotify.com/episode/4M7CNfjg0C2BD6SpyPFuaI?si=niArWe7EQDyqiXt610MDzg',
  },
  {
    title: 'How Introducing Competition Fixes DeFi (Strange Water)',
    link: 'https://strangewater.xyz/episode/sw48',
  },
  {
    title: 'CoW Swap - The Only DEX You Need In DeFi? (Leviathan News)',
    link: 'https://open.spotify.com/episode/4M7CNfjg0C2BD6SpyPFuaI?si=niArWe7EQDyqiXt610MDzg',
  },
]

const SPACES = [
  {
    title: 'CoW Swap is one of the most exciting projects in the DEX space',
    link: 'https://x.com/cryptotesters/status/1501505365833248774',
  },
  {
    title: 'CoW Protocol & Yearn Finance Partnership Deep Dive',
    link: 'https://x.com/CoWSwap/status/1605593667682476032',
  },
  {
    title: 'CoW Swap & ENS: Pushing Decentralized Trading to its limits',
    link: 'https://x.com/CoWSwap/status/1625932839936983055',
  },
  { title: 'CoW AMM is the 1st MEV-Capturing AMM', link: 'https://x.com/CoWSwap/status/1759633529279791584' },
]

const MEDIA_COVERAGE = [
  {
    title: 'Bots fleece DeFi liquidity providers for $500m every year. CoW DAO’s new exchange stops them ',
    publisher: 'DLNews',
    image: '/images/media-coverage/DLNews-bots-fleece.webp',
    link: 'https://www.dlnews.com/articles/defi/new-cow-swap-amm-will-stop-mev-bots-and-save-users-millions/',
    linkExternal: true,
  },
  {
    title: 'Ethereum projects unite to protect users from MEV-induced high prices',
    publisher: 'The Crypto Times',
    image: '/images/media-coverage/Ethereum-Foundation-Raises-Funds-Website.webp',
    link: 'https://www.cryptotimes.io/2024/01/22/ethereum-foundation-sells-700-eth-via-cow-protocol/',
    linkExternal: true,
  },
  {
    title: 'CoW Swap: A Beginner’s Guide to This New Decentralized Exchange',
    publisher: 'BeInCrypto',
    image: '/images/media-coverage/learn_CoW_Swap-covers_logo.webp',
    link: 'https://beincrypto.com/learn/cow-swap-guide/',
    linkExternal: true,
  },
  {
    title: 'CoW Swap: Intents, MEV, and Batch Auctions',
    publisher: 'Shoal Research',
    image: '/images/media-coverage/shoal-research-intents.webp',
    link: 'https://www.shoal.gg/p/cow-swap-intents-mev-and-batch-auctions',
    linkExternal: true,
  },
]

interface PageProps {
  siteConfigData: typeof CONFIG
  categories: {
    name: string
    slug: string
    description: string
    bgColor: string
    textColor: string
    link: string
    iconColor: string
    imageUrl: string
  }[]
  articles: ArticleListResponse['data']
  featuredArticles: {
    title: string
    description: string
    link: string
    cover: string
  }[]
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1760px;
  width: 100%;
  margin: 42px auto 0;
  gap: 24px;

  h1 {
    font-size: 28px;
    font-weight: ${Font.weight.medium};
    color: ${Color.neutral50};
    text-align: center;
    padding: 0 10px;

    ${Media.upToMedium()} {
      font-size: 18px;
    }
  }

  h2 {
    font-size: 67px;
    text-align: center;
    padding: 0 10px 16px;

    ${Media.upToMedium()} {
      font-size: 26px;
    }
  }
`

export default function Page({ siteConfigData, categories, articles, featuredArticles }: PageProps) {
  const { title } = siteConfigData

  return (
    <Layout metaTitle={`Knowledge Base - ${title}`}>
      <Wrapper>
        <h1>Learn - Knowledge Base</h1>
        <h2>Hi, how can we help?</h2>

        <CategoryLinks noDivider>
          {categories.map((category: { name: string; slug: string }) => (
            <li key={category.slug}>
              <a
                href={`/learn/topic/${category.slug}`}
                onClick={() => clickOnKnowledgeBase(`click-topic-${category.name}`)}
              >
                {category.name}
              </a>
            </li>
          ))}
        </CategoryLinks>

        <SearchBar articles={articles} />

        <ContainerCard marginMobile="0 auto 24px">
          <ContainerCardInner maxWidth={1350}>
            <ContainerCardSection>
              <ContainerCardSectionTop alignMobile="center">
                <ContainerCardSectionTopTitle>Featured articles</ContainerCardSectionTopTitle>
                <ArrowButton link="/learn/articles" text="All articles" />
              </ContainerCardSectionTop>
              <ArticleList columnsTablet={2}>
                {featuredArticles.map(({ title, description, cover, link }, index) => (
                  <ArticleCard key={index} href={link} onClick={() => clickOnKnowledgeBase(`click-article-${title}`)}>
                    <ArticleImage color="#000">{cover && <CmsImage src={cover} alt={title} />}</ArticleImage>
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
                {categories.map(({ name, bgColor, textColor, iconColor, link, imageUrl }, index) => {
                  return (
                    <TopicCard
                      key={index}
                      bgColor={bgColor}
                      textColor={textColor}
                      href={link}
                      onClick={() => clickOnKnowledgeBase(`click-topic-${name}`)}
                    >
                      <TopicImage iconColor={iconColor} bgColor={bgColor} borderRadius={90} widthMobile={'auto'}>
                        {imageUrl ? (
                          <CmsImage
                            src={imageUrl}
                            alt={name}
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <span>{name.charAt(0)}</span>
                        )}
                      </TopicImage>
                      <TopicTitle>{name}</TopicTitle>
                    </TopicCard>
                  )
                })}
              </TopicList>
            </ContainerCardSection>

            <ContainerCardSection>
              <ContainerCardSectionTop>
                <ContainerCardSectionTopTitle>Podcasts & Spaces</ContainerCardSectionTopTitle>
              </ContainerCardSectionTop>
              <LinkSection gap={56}>
                <LinkColumn>
                  <h5>Podcasts</h5>
                  {PODCASTS.map((podcast, index) => (
                    <LinkItem
                      key={index}
                      href={`${podcast.link}?utm_source=cow.fi&utm_medium=web&utm_content=podcast-${podcast.title}`}
                      rel="noopener noreferrer nofollow"
                      target="_blank"
                      onClick={() => clickOnKnowledgeBase(`click-podcast-${podcast.title}`)}
                    >
                      {podcast.title}
                      <span>→</span>
                    </LinkItem>
                  ))}
                </LinkColumn>

                <LinkColumn>
                  <h5>Spaces</h5>
                  {SPACES.map((space, index) => (
                    <LinkItem
                      key={index}
                      href={`${space.link}?utm_source=cow.fi&utm_medium=web&utm_content=space-${space.title}`}
                      rel="noopener noreferrer nofollow"
                      target="_blank"
                      onClick={() => clickOnKnowledgeBase(`click-space-${space.title}`)}
                    >
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
                    href={`${link}?utm_source=cow.fi&utm_medium=web&utm_content=media-${title}`}
                    target={linkExternal ? '_blank' : '_self'}
                    rel={linkExternal ? 'noopener' : ''}
                    onClick={() => clickOnKnowledgeBase(`click-media-${title}`)}
                  >
                    <ArticleImage>{image && <img src={image} alt={title} />}</ArticleImage>
                    <ArticleTitle fontSize={21}>{title}</ArticleTitle>
                    <ArticleDescription>Published by {publisher}</ArticleDescription>
                  </ArticleCard>
                ))}
              </ArticleList>
            </ContainerCardSection>
          </ContainerCardInner>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral98} padding="0" touchFooter>
          <CTASectionWrapper>
            <CTAImage color={'#00A1FF'}>
              <SVG src={IMG_ICON_BULB_COW} />
            </CTAImage>
            <CTASubtitle>Explore, learn, integrate</CTASubtitle>
            <CTATitle>CoW DAO documentation</CTATitle>
            <CTAButton
              href="https://docs.cow.fi/?utm_source=cow.fi&utm_medium=web&utm_content=cta-read-docs"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => clickOnKnowledgeBase('click-read-docs')}
            >
              Read the docs
            </CTAButton>
          </CTASectionWrapper>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const siteConfigData = CONFIG
  const categoriesResponse = await getCategories()
  const articlesResponse = await getArticles()

  const featuredArticlesResponse = await getArticles({
    filters: { featured: { $eq: true } },
    pageSize: 6,
  })

  const categories =
    categoriesResponse?.map((category: any) => {
      const imageUrl = category?.attributes?.image?.data?.attributes?.url || ''

      return {
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
        description: category?.attributes?.description || '',
        bgColor: category?.attributes?.backgroundColor || '#fff',
        textColor: category?.attributes?.textColor || '#000',
        link: `/learn/topic/${category?.attributes?.slug}`,
        iconColor: '#fff',
        imageUrl,
      }
    }) || []

  const featuredArticles = featuredArticlesResponse.data.map((article) => {
    const attributes = article.attributes
    return {
      title: attributes?.title || 'No title',
      description: attributes?.description || 'No description',
      link: `/learn/${attributes?.slug || 'no-slug'}`,
      cover: attributes?.cover?.data?.attributes?.url || '',
    }
  })

  return {
    props: {
      siteConfigData,
      categories,
      articles: articlesResponse.data,
      featuredArticles,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
