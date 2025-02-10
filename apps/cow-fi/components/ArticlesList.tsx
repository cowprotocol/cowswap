import React from 'react'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import { LinkItem, LinkColumn } from '@/styles/styled'
import { Article } from 'services/cms'

interface ArticlesListProps {
  articles: Article[]
}

const ARTICLES_PATH = '/learn/'

export const ArticlesList: React.FC<ArticlesListProps> = ({ articles }) => {
  const analytics = useCowAnalytics()

  return (
    <LinkColumn>
      {articles.map((article) => {
        if (!article.attributes) return null

        const { slug, title } = article.attributes

        return (
          <LinkItem
            key={article.id}
            href={`${ARTICLES_PATH}${slug}`}
            onClick={() =>
              analytics.sendEvent({
                category: CowFiCategory.KNOWLEDGEBASE,
                action: 'Click article',
                label: title,
              })
            }
          >
            {title}
            <span>→</span>
          </LinkItem>
        )
      })}
    </LinkColumn>
  )
}
