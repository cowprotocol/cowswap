import React from 'react'
import styled from 'styled-components/macro'
import { clickOnKnowledgeBase } from 'modules/analytics'

interface Category {
  name: string
  slug: string
}

interface CategoryLinksProps {
  allCategories: Category[]
}

const CategoryLinksWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: yellow;
  border: 10px solid red;
`

const CategoryLinksComponent: React.FC<CategoryLinksProps> = ({ allCategories }) => (
  <CategoryLinksWrapper>
    <li>
      <a href="/learn" onClick={() => clickOnKnowledgeBase('click-categories-home')}>
        Knowledge Base
      </a>
    </li>
    {allCategories.map((category) => (
      <li key={category.slug}>
        <a
          href={`/learn/topic/${category.slug}`}
          onClick={() => clickOnKnowledgeBase(`click-categories-${category.name}`)}
        >
          {category.name}
        </a>
      </li>
    ))}
  </CategoryLinksWrapper>
)

export default CategoryLinksComponent
