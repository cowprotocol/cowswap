import Link from 'next/link'

import React from 'react'
import styled from 'styled-components'

import Layout from '@/components/Layout'
import Head from 'next/head'

import {
  Section,
  SectionContent,
  SubTitle,
  CardWrapper,
  CardItem,
} from '@/components/Home/index.styles'


import { Color } from '@/styles/variables'
import { Category } from 'services/cms'



const CategoryContentWrapper = styled.article`
a {
  font-size: 1.2rem;
  color: white;
  margin: 1rem 0 0.5rem 0;
}
`

export interface CategoryListProps {
    categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <CardWrapper maxWidth={100}>
      {categories.map((category) => {
        const { name, description, slug, image, textColor, backgroundColor } = category.attributes
        const imageUrl = image?.data?.attributes?.url
        return (
          <CardItem 
            key={slug} 
            data-category={slug} 
            imageHeight={8} 
            imageRounded 
            background={backgroundColor} 
            color={textColor}>
              {imageUrl && <img src={imageUrl} alt="image" />}                    
              <h4><Link href={`/learn/categories/${slug}`}>{name}</Link></h4>
              <p>{description}</p>
          </CardItem>
        )
      })}
    </CardWrapper>
  )
}


interface CategoryContentProps {
    category: Category;
}


export function CategoryContent({ category }: CategoryContentProps) {
  const { id } = category
  const { name, slug, description, image, articles, backgroundColor, textColor } = category?.attributes || {}
  const shareImageUrl = image?.data?.attributes?.url

  return (
    <>
      <Head>
        <title>{name} CoW</title>
        
        <meta name="description" content={description} key="description" />
        <meta property="og:description" content={description} key="og-description" />
        <meta property="og:title" content={name} key="og-title" />
        <meta name="twitter:title" content={name} key="twitter-title" />
        {shareImageUrl && (
          <>
            <meta key="ogImage" property="og:image" content={shareImageUrl} />
            <meta key="twitterImage" name="twitter:image" content={shareImageUrl} />
          </>
        )}
      </Head>

      <Layout fullWidthGradientVariant={false}>
        <CategoryContentWrapper data-slug={slug} data-id={id}>
          <code>
            {JSON.stringify(category)}
          </code>

          <h1>{name}</h1>
          {/* <ArticleSubtitle dateIso={publishedAt} authorsBio={authorsBio} />
          <p>{description}</p>

          {blocks && (
          <ArticleBlocksWrapper>
            {blocks.map(block => <ArticleBlockComponent key={block.id} block={block} />)}
          </ArticleBlocksWrapper>
          )} */}

          <Link href="/learn">Go back</Link>
        </CategoryContentWrapper>
      </Layout>
    </>
  )
}


