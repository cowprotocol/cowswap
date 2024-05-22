import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Font, Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import LayoutV2 from '@/components/Layout/LayoutV2'
import { Category, getCategories } from 'services/cms'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

const FEATURED_ARTICLES = [
  {
    title: 'What is a Sandwich Attack? — MEV Attacks Explained',
    description: 'Sandwich attacks make up the majority of harmful MEV extraction',
    color: '#0B6623',
    link: '/article/sandwich-attack',
    linkExternal: false,
  },
  {
    title: 'What is a Smart Contract?',
    description:
      'Smart Contracts enable the majority of decentralized apps and are critical to modern blockchain ecosystems',
    color: '#FFD700',
    link: '/article/smart-contract',
    linkExternal: false,
  },
  {
    title: 'CoW DAO April 2024 Highlights',
    description:
      'Welcome back to CoW DAO highlights, where we break down the most notable developments of the last few weeks at CoW DAO.',
    color: '#FF69B4',
    link: '/article/cow-dao-april-2024',
    linkExternal: false,
  },
  {
    title: 'What is a Sandwich Attack? — MEV Attacks Explained',
    description: 'Sandwich attacks make up the majority of harmful MEV extraction',
    color: '#800020',
    link: '/article/sandwich-attack',
    linkExternal: false,
  },
  {
    title: 'What is a Smart Contract?',
    description:
      'Smart Contracts enable the majority of decentralized apps and are critical to modern blockchain ecosystems',
    color: '#00BFFF',
    link: '/article/smart-contract',
    linkExternal: false,
  },
  {
    title: 'CoW DAO April 2024 Highlights',
    description:
      'Welcome back to CoW DAO highlights, where we break down the most notable developments of the last few weeks at CoW DAO.',
    color: '#FF4500',
    link: '/article/cow-dao-april-2024',
    linkExternal: false,
  },
]

// const TOPICS = [
//   {
//     title: 'Getting started',
//     bgColor: '#FF4500',
//     iconColor: '#800020',
//     textColor: Color.neutral100,
//     link: '/getting-started',
//   },
//   {
//     title: 'Crypto basics',
//     bgColor: '#FF69B4',
//     iconColor: '#000080',
//     textColor: Color.neutral0,
//     link: '/crypto-basics',
//   },
//   { title: 'MEV', bgColor: '#FFD700', iconColor: '#FF4500', textColor: Color.neutral0, link: '/mev' },
//   { title: 'Guides', bgColor: '#00BFFF', iconColor: '#0B6623', textColor: Color.neutral0, link: '/guides' },
//   { title: 'Governance', bgColor: '#000080', iconColor: '#00BFFF', textColor: Color.neutral100, link: '/governance' },
//   { title: 'Token', bgColor: '#0B6623', iconColor: '#FFD700', textColor: Color.neutral100, link: '/token' },
//   { title: 'Docs', bgColor: '#FFDAB9', iconColor: '#0B6623', textColor: Color.neutral0, link: '/docs' },
//   { title: 'FAQ', bgColor: '#800020', iconColor: '#FF4500', textColor: Color.neutral100, link: '/faq' },
// ]

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

interface KnowledgeBaseProps {
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
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1600px;
  width: 100%;
  margin: 76px auto 0;

  h1 {
    font-size: 28px;
    font-weight: ${Font.weight.medium};
    color: ${Color.neutral50};
  }

  h2 {
    font-size: 67px;
  }
`

const SearchBar = styled.input`
  padding: 16px 24px;
  min-height: 56px;
  border: 2px solid transparent;
  font-size: 21px;
  color: ${Color.neutral60};
  margin: 16px 0;
  max-width: 970px;
  width: 100%;
  background: ${Color.neutral90};
  border-radius: 56px;
  appearance: none;
  font-weight: ${Font.weight.medium};
  transition: border 0.2s ease-in-out;

  &:focus {
    outline: none;
    border: 2px solid ${Color.neutral50};
  }

  &::placeholder {
    color: inherit;
    transition: color 0.2s ease-in-out;
  }

  &:focus::placeholder {
    color: transparent;
  }
`

const ContainerCard = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: 24px;
  margin: 24px 0;
  width: 100%;
  padding: 60px;
  border-radius: 60px;
  background: ${Color.neutral90};

  ${Media.upToMedium()} {
    padding: 24px;
    gap: 16px;
  }
`

const ContainerCardSection = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 24px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`

const ContainerCardSectionTop = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 24px;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  > h3 {
    font-size: 38px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral10};
  }
`

const ArticleList = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 3}, 1fr);
  gap: 64px 32px;
  justify-content: space-between;
  width: 100%;

  ${Media.upToMedium()} {
    grid-template-columns: repeat(${({ columnsMobile }) => columnsMobile || 1}, 1fr);
  }
`

const ArticleCard = styled.a`
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 20px;
  width: 100%;
  text-decoration: none;

  h4 {
    font-size: 28px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    margin: 16px 0 8px;
    line-height: 1.2;
  }

  p {
    font-size: 16px;
    color: ${Color.neutral0};
    font-weight: ${Font.weight.medium};
    line-height: 1.5;
  }
`

const ArticleImage = styled.div<{ color?: string }>`
  width: 100%;
  height: 200px;
  background: ${({ color }) => color || Color.neutral70};
  border-radius: 20px;
`

const ArticleTitle = styled.h4`
  font-size: 18px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 16px 0 8px;
`

const ArticleDescription = styled.p`
  font-size: 14px;
  color: ${Color.neutral0};
`

const TopicList = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 4}, 1fr)`};
  gap: 32px;
  width: 100%;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: 16px;
  }
`

const TopicCard = styled.a<{ bgColor: string; textColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ textColor }) => textColor || Color.neutral0};
  padding: 56px 20px;
  border-radius: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: ${Font.weight.bold};
  text-decoration: none;
  border: 4px solid transparent;
  transition: border 0.2s ease-in-out;
  gap: 56px;

  &:hover {
    border: 4px solid ${Color.neutral40};
  }

  ${Media.upToMedium()} {
    padding: 32px 16px;
    gap: 32px;
  }

  > h5 {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    padding: 0;
    margin: 0;
  }
`

const TopicImage = styled.div<{ iconColor: string }>`
  width: 100px;
  height: 100px;
  background: ${({ iconColor }) => iconColor || Color.neutral90};
  color: ${({ iconColor }) => iconColor || Color.neutral90};
  border-radius: 50%;
  margin-bottom: 16px;

  svg {
    fill: currentColor;
  }
`

const LinkSection = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 2}, 1fr)`};
  background: ${Color.neutral100};
  border-radius: 28px;
  padding: 24px;
  width: 100%;
  gap: 24px;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
  }
`

const LinkColumn = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 0;
  width: 100%;

  > h5 {
    font-size: 21px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    margin: 0 0 16px;
    line-height: 1.2;
  }
`

const LinkItem = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 18px;
  border-radius: 36px;
  padding: 4px 8px 4px 16px;
  text-decoration: none;
  color: ${Color.neutral50};
  transition: color 0.2s ease-in-out;
  line-height: 1.2;

  &:hover {
    color: ${Color.neutral0};
    background: ${Color.neutral80};

    > span {
      color: ${Color.neutral0};
      background: ${Color.neutral100};
      transform: translateX(3px);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }

  > span {
    --size: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--size);
    width: var(--size);
    color: ${Color.neutral50};
    transition: color 0.2s ease-in-out;
    border-radius: 24px;
    font-size: 24px;
    transition: transform 0.2s ease-in-out;
  }
`

const CTASectionWrapper = styled.section`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 28px;
  padding: 0 24px;
  background: transparent;
  text-align: center;
  margin: 100px 0;
`

const CTAImage = styled.div<{ bgColor?: string }>`
  --size: 100px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: ${({ bgColor }) => bgColor || Color.neutral50};
  padding: 0;

  > img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const CTATitle = styled.h6`
  font-size: 48px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 0;
  line-height: 1.2;
  white-space: wrap;

  ${Media.upToMedium()} {
    font-size: 38px;
  }
`

const CTASubtitle = styled.p`
  font-size: 28px;
  color: ${Color.neutral30};
  margin: 0;
  line-height: 1.2;
`

const CTAButton = styled.a`
  --height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--height);
  padding: 12px 24px;
  font-size: 24px;
  font-weight: ${Font.weight.medium};
  color: ${Color.neutral98};
  background: ${Color.neutral0};
  border: none;
  border-radius: var(--height);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    color: ${Color.neutral100};
    background: ${Color.neutral20};
  }
`

export default function KnowledgeBase({ siteConfigData, categories }: KnowledgeBaseProps) {
  return (
    <LayoutV2>
      <Head>
        <title>
          {siteConfigData.title} - {siteConfigData.descriptionShort}
        </title>
      </Head>

      <Wrapper>
        <h1>Knowledge Base</h1>
        <h2>Hi, how can we help?</h2>

        <SearchBar placeholder="Search any topic..." />

        <ContainerCard>
          <ContainerCardSection>
            <ContainerCardSectionTop>
              <h3>Featured articles</h3>
              <button>View all articles</button>
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
              <h3>Topics</h3>
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
              <h3>Podcasts & Spaces</h3>
              <button>View all</button>
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
              <h3>Media coverage</h3>
              <button>View all</button>
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

        <CTASectionWrapper>
          <CTAImage bgColor={'#00A1FF'}></CTAImage>
          <CTASubtitle>Explore, learn, integrate</CTASubtitle>
          <CTATitle>CoW DAO documentation</CTATitle>
          <CTAButton href="/docs" target="_self">
            Read the docs
          </CTAButton>
        </CTASectionWrapper>
      </Wrapper>
    </LayoutV2>
  )
}

export const getStaticProps: GetStaticProps<KnowledgeBaseProps> = async () => {
  const siteConfigData = CONFIG
  const categoriesResponse = await getCategories()

  const categories =
    categoriesResponse?.map((category: Category) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
      description: category?.attributes?.description || '',
      bgColor: category?.attributes?.backgroundColor || '#fff',
      textColor: category?.attributes?.textColor || '#000',
      link: `/topic/${category?.attributes?.slug}`,
      iconColor: '#fff',
    })) || []

  return {
    props: {
      siteConfigData,
      categories,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
