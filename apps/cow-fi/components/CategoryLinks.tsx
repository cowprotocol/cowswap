import React from 'react'
import styled from 'styled-components/macro'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import { Color, Media } from '@cowprotocol/ui'
import Link from 'next/link'

interface CategoryItem {
  name: string
  slug: string
}

interface CategoryLinksProps {
  allCategories: CategoryItem[]
  noDivider?: boolean
}

const CategoryLinksWrapper = styled.ul<{ noDivider?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 16px;
  font-weight: 500;
  color: ${Color.neutral50};
  width: 100%;
  scrollbar-width: thin;
  scrollbar-color: ${Color.neutral70} ${Color.neutral90};
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${Color.neutral90};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${Color.neutral70};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${Color.neutral50};
  }

  ${Media.upToMedium()} {
    overflow-x: auto;
    overflow-y: hidden;
    flex-flow: row nowrap;
    justify-content: flex-start;
    gap: 24px;
    padding: 16px 34px 16px 16px;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: center;

    &:first-child {
      margin-right: ${({ noDivider }) => (noDivider ? '0' : '-32px')};
    }

    &:first-child::after {
      content: ${({ noDivider }) => (noDivider ? 'none' : "'|'")};
      margin: 0 16px;
      display: flex;
      height: 100%;
      width: 16px;
      align-items: center;
      justify-content: center;
    }
  }

  a {
    color: ${Color.neutral40};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    white-space: nowrap;
    line-height: 1;

    &:hover {
      color: ${Color.neutral0};
    }
  }
`

export const CategoryLinks: React.FC<CategoryLinksProps> = ({ allCategories, noDivider }) => {
  const analytics = useCowAnalytics()

  return (
    <CategoryLinksWrapper noDivider={noDivider}>
      <li>
        <Link
          href="/learn"
          onClick={() =>
            analytics.sendEvent({
              category: CowFiCategory.KNOWLEDGEBASE,
              action: 'Click category',
              label: 'home',
            })
          }
        >
          Knowledge Base
        </Link>
      </li>
      {allCategories.map((category) => (
        <li key={category.slug}>
          <Link
            href={`/learn/topic/${category.slug}`}
            onClick={() =>
              analytics.sendEvent({
                category: CowFiCategory.KNOWLEDGEBASE,
                action: 'Click category',
                label: category.name,
              })
            }
          >
            {category.name}
          </Link>
        </li>
      ))}
    </CategoryLinksWrapper>
  )
}
