import React from 'react'
import { initGtm } from '@cowprotocol/analytics'
import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'
import { LinkItem, LinkColumn } from '@/styles/styled'
import { Article } from 'services/cms'

const analytics = initGtm()

interface ArticlesListProps {
  articles: Article[]
}

const ARTICLES_PATH = '/learn/'

export const ArticlesList: React.FC<ArticlesListProps> = ({ articles }) => (
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
