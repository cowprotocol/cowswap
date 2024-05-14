import Link from 'next/link'

import React from 'react'
import styled from 'styled-components'

import { CardWrapper, CardItem } from '@/components/Home/index.styles'

import { Section, SectionContent, SubTitle } from '@/components/Home/index.styles'

import { Color } from '@/styles/variables'

import { Article, Category } from 'services/cms'
import { ArticleList } from './Article'

const CategoryContentWrapper = styled.article`
  a {
    font-size: 1.2rem;
    color: white;
    margin: 1rem 0 0.5rem 0;
  }
`

export interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <CardWrapper maxWidth={100}>
      {categories.map((category) => {
        if (!category.attributes) return null

        const { name, description, slug, image, textColor, backgroundColor } = category.attributes
        const imageUrl = image?.data?.attributes?.url
        return (
          <CardItem
            key={slug}
            data-category={slug}
            imageHeight={8}
            imageRounded
            background={backgroundColor}
            color={textColor}
          >
            {imageUrl && <img src={imageUrl} alt="image" />}
            <h4>
              <Link href={`/learn/categories/${slug}`}>{name}</Link>
            </h4>
            <p>{description}</p>
          </CardItem>
        )
      })}
    </CardWrapper>
  )
}

interface CategoryContentProps {
  category: Category
}

export function CategoryContent({ category }: CategoryContentProps) {
  const { id } = category
  const { name, slug, description, image, articles } = category?.attributes || {}

  return (
    <>
      <Section fullWidth padding="0 8rem 4rem 8rem">
        <SectionContent flow="column">
          <div className="container">
            <h3>{name}</h3>
            <SubTitle color={Color.text1} lineHeight={1.4} maxWidth={70}>
              {description}
            </SubTitle>
          </div>
        </SectionContent>
      </Section>

      
      <Section fullWidth colorVariant={'white'} flow="column" gap={14} padding="4rem 8rem 12rem 8rem">
        <SectionContent flow={'row'} maxWidth={100} textAlign={'left'}>
          <div className="container">
            <h3>Articles</h3>

            {articles ? (
            <CategoryContentWrapper data-slug={slug} data-id={id}>
              <ArticleList articles={articles?.data as Article[]} />

              {/*
            // TODO: Useful for debugging. Please let me have it here for now until first release :)
            <pre style={{ lineHeight: '1.5em' }}>
              {JSON.stringify(category, null, 2)}
            </pre>
            */}
            </CategoryContentWrapper>
              
            ): (
              <>There are no articles for this category yet.</>
            )}

          </div>
        </SectionContent>
      </Section>
    </>
  )
}
