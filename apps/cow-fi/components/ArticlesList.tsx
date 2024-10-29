import React from 'react'
import { LinkItem, LinkColumn } from '@/styles/styled'
import { Article } from 'services/cms'

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
        <LinkItem key={article.id} href={`${ARTICLES_PATH}${slug}`}>
          {title}
          <span>→</span>
        </LinkItem>
      )
    })}
  </LinkColumn>
)
