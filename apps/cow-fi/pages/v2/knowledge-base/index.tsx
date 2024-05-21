import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Font, Color } from '@cowprotocol/ui'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import LayoutV2 from '@/components/Layout/LayoutV2'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

const FEATURED_ARTICLES = [
  {
    title: 'What is a Sandwich Attack? — MEV Attacks Explained',
    description: 'Sandwich attacks make up the majority of harmful MEV extraction',
    color: '#0B6623',
  },
  {
    title: 'What is a Smart Contract?',
    description:
      'Smart Contracts enable the majority of decentralized apps and are critical to modern blockchain ecosystems',
    color: '#FFD700',
  },
  {
    title: 'CoW DAO April 2024 Highlights',
    description:
      'Welcome back to CoW DAO highlights, where we break down the most notable developments of the last few weeks at CoW DAO.',
    color: '#FF69B4',
  },
  {
    title: 'What is a Sandwich Attack? — MEV Attacks Explained',
    description: 'Sandwich attacks make up the majority of harmful MEV extraction',
    color: '#800020',
  },
  {
    title: 'What is a Smart Contract?',
    description:
      'Smart Contracts enable the majority of decentralized apps and are critical to modern blockchain ecosystems',
    color: '#00BFFF',
  },
  {
    title: 'CoW DAO April 2024 Highlights',
    description:
      'Welcome back to CoW DAO highlights, where we break down the most notable developments of the last few weeks at CoW DAO.',
    color: '#FF4500',
  },
]

const TOPICS = [
  {
    title: 'Getting started',
    bgColor: '#FF4500',
    iconColor: '#800020',
    textColor: Color.neutral100,
    link: '/getting-started',
  },
  {
    title: 'Crypto basics',
    bgColor: '#FF69B4',
    iconColor: '#000080',
    textColor: Color.neutral0,
    link: '/crypto-basics',
  },
  { title: 'MEV', bgColor: '#FFD700', iconColor: '#FF4500', textColor: Color.neutral0, link: '/mev' },
  { title: 'Guides', bgColor: '#00BFFF', iconColor: '#0B6623', textColor: Color.neutral0, link: '/guides' },
  { title: 'Governance', bgColor: '#000080', iconColor: '#00BFFF', textColor: Color.neutral100, link: '/governance' },
  { title: 'Token', bgColor: '#0B6623', iconColor: '#FFD700', textColor: Color.neutral100, link: '/token' },
  { title: 'Docs', bgColor: '#FFDAB9', iconColor: '#0B6623', textColor: Color.neutral0, link: '/docs' },
  { title: 'FAQ', bgColor: '#800020', iconColor: '#FF4500', textColor: Color.neutral100, link: '/faq' },
]

interface KnowledgeBaseProps {
  siteConfigData: typeof CONFIG
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
  border: 0;
  font-size: 21px;
  color: ${Color.neutral60};
  margin: 16px 0;
  max-width: 970px;
  width: 100%;
  background: ${Color.neutral90};
  border-radius: 56px;
  appearance: none;
  font-weight: ${Font.weight.medium};

  // outline color border
  &:focus {
    outline: none;
    border: 2px solid ${Color.neutral50};
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

const ArticleList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  justify-content: space-between;
  width: 100%;
`

const ArticleCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 20px;
  width: 100%;

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

const ArticleImage = styled.div<{ color: string }>`
  width: 100%;
  height: 200px;
  background: ${({ color }) => color || Color.neutral90};
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

const TopicList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  width: 100%;
`

const TopicCard = styled.a<{ bgColor: string; textColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ textColor }) => textColor || Color.neutral0};
  padding: 40px 20px;
  border-radius: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: ${Font.weight.bold};
  text-decoration: none;
  border: 4px solid transparent;
  transition: border 0.2s ease-in-out;

  &:hover {
    border: 4px solid ${Color.neutral40};
  }

  > h5 {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
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

export default function KnowledgeBase({ siteConfigData }: KnowledgeBaseProps) {
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
              {FEATURED_ARTICLES.map((article, index) => (
                <ArticleCard key={index}>
                  <ArticleImage color={article.color}></ArticleImage>
                  <ArticleTitle>{article.title}</ArticleTitle>
                  <ArticleDescription>{article.description}</ArticleDescription>
                </ArticleCard>
              ))}
            </ArticleList>
          </ContainerCardSection>

          <ContainerCardSection>
            {' '}
            <ContainerCardSectionTop>
              <h3>Topics</h3>
            </ContainerCardSectionTop>
            <TopicList>
              {TOPICS.map((topic, index) => (
                <TopicCard key={index} bgColor={topic.bgColor} textColor={topic.textColor} href={topic.link}>
                  <TopicImage iconColor={topic.iconColor}></TopicImage>
                  <h5>{topic.title}</h5>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>
      </Wrapper>
    </LayoutV2>
  )
}

export const getStaticProps: GetStaticProps<KnowledgeBaseProps> = async () => {
  const siteConfigData = CONFIG

  return {
    props: {
      siteConfigData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
