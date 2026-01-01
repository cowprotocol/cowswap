import React from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Media, UI } from '@cowprotocol/ui'

import Link from 'next/link'
import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'

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
  color: var(${UI.COLOR_NEUTRAL_50});
  width: 100%;
  scrollbar-width: thin;
  scrollbar-color: var(${UI.COLOR_NEUTRAL_70}) var(${UI.COLOR_NEUTRAL_90});
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(${UI.COLOR_NEUTRAL_90});
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(${UI.COLOR_NEUTRAL_70});
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(${UI.COLOR_NEUTRAL_50});
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
    color: var(${UI.COLOR_NEUTRAL_40});
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    white-space: nowrap;
    line-height: 1;

    &:hover {
      color: var(${UI.COLOR_NEUTRAL_0});
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
