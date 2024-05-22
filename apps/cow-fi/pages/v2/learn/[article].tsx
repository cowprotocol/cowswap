import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { CONFIG } from '@/const/meta'
import LayoutV2 from '@/components/Layout/LayoutV2'
import { getArticleBySlug, getAllArticleSlugs, Article } from 'services/cms'
import { ArticleSharedRichTextComponent, ArticleSubtitle } from '@/components/Article'

import { Breadcrumbs, ContainerCard } from './styled'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

interface ArticlePageProps {
  siteConfigData: typeof CONFIG
  article: Article
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;
  max-width: 1600px;
`

const ArticleContent = styled.div`
  --maxWidth: 725px;
  width: 100%;
  max-width: var(--maxWidth);
  flex: 3;
  padding: 0;
  border-radius: 20px;
`

const StickyMenu = styled.div`
  --maxWidth: 344px;
  width: 100%;
  max-width: var(--maxWidth);
  height: min-content;
  flex: 1;
  position: sticky;
  top: 100px;
  background: ${Color.neutral100};
  padding: 20px;
  border-radius: 32px;
`

const Title = styled.h1`
  font-size: 36px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin-bottom: 16px;

  ${Media.upToMedium()} {
    font-size: 24px;
  }
`

const BodyContent = styled.div`
  font-size: 18px;
  line-height: 1.6;
  color: ${Color.neutral0};

  img {
    max-width: 100%;
    border-radius: 10px;
    margin-top: 20px;
  }
`

const RelatedArticles = styled.div`
  font-size: 18px;
  color: ${Color.neutral0};

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 8px;
    }

    a {
      color: ${Color.neutral0};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`

export default function ArticlePage({ siteConfigData, article }: ArticlePageProps) {
  const { title, blocks, publishedAt, authorsBio } = article.attributes || {}

  return (
    <LayoutV2>
      <Head>
        <title>
          {title} - {siteConfigData.title}
        </title>
      </Head>

      <Wrapper>
        <ContainerCard gap={80}>
          <ArticleContent>
            <Breadcrumbs>
              <a href="/v2/learn">Learn</a>
              <span>{title}</span>
            </Breadcrumbs>

            <Title>{title}</Title>
            <ArticleSubtitle dateIso={publishedAt!} authorsBio={authorsBio} />
            <BodyContent>
              {blocks &&
                blocks.map((block) => <ArticleSharedRichTextComponent key={block.id} sharedRichText={block} />)}{' '}
            </BodyContent>
          </ArticleContent>

          <StickyMenu>
            <h2>Related Articles</h2>
            <RelatedArticles>
              <ul>
                {/* Example of related articles, replace with real data */}
                <li>
                  <a href={`/article/related-article-1`}>Related Article 1</a>
                </li>
                <li>
                  <a href={`/article/related-article-2`}>Related Article 2</a>
                </li>
                <li>
                  <a href={`/article/related-article-3`}>Related Article 3</a>
                </li>
              </ul>
            </RelatedArticles>
          </StickyMenu>
        </ContainerCard>
      </Wrapper>
    </LayoutV2>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllArticleSlugs()
  const paths = slugs.map((slug) => ({ params: { article: slug } }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<ArticlePageProps> = async ({ params }) => {
  const siteConfigData = CONFIG
  const articleSlug = params?.article as string
  const article = await getArticleBySlug(articleSlug)

  if (!article) {
    return { notFound: true }
  }

  return {
    props: {
      siteConfigData,
      article,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
