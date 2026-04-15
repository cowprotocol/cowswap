import type { ReactNode } from 'react'
import type { HTMLAttributes, AnchorHTMLAttributes } from 'react'
import { isValidElement } from 'react'

import { Font, Media, UI } from '@cowprotocol/ui'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styled from 'styled-components/macro'

import { CustomUl, CustomOl, CustomLi } from './ListComponents'
import { CustomTable, CustomTHead, CustomTBody, CustomTr, CustomTh, CustomTd } from './TableComponents'

interface CmsContentProps {
  content: string
}

// Styled heading components that use the correct font-family
const StyledH1 = styled.h1`
  font-family: ${Font.family};
  font-size: 4.2rem;
  font-weight: ${Font.weight.bold};
  line-height: 1.2;
  color: var(${UI.COLOR_NEUTRAL_0});
  margin: 3.2rem 0 1.6rem;

  ${Media.upToMedium()} {
    font-size: 3.6rem;
    margin: 2.4rem 0 1.2rem;
  }
`

const StyledH2 = styled.h2`
  font-family: ${Font.family};
  font-size: 3.6rem;
  font-weight: ${Font.weight.bold};
  line-height: 1.2;
  color: var(${UI.COLOR_NEUTRAL_0});
  margin: 2.8rem 0 1.4rem;

  ${Media.upToMedium()} {
    font-size: 3rem;
    margin: 2rem 0 1rem;
  }
`

const StyledH3 = styled.h3`
  font-family: ${Font.family};
  font-size: 3rem;
  font-weight: ${Font.weight.bold};
  line-height: 1.2;
  color: var(${UI.COLOR_NEUTRAL_0});
  margin: 2.4rem 0 1.2rem;

  ${Media.upToMedium()} {
    font-size: 2.6rem;
    margin: 1.8rem 0 0.8rem;
  }
`

const StyledH4 = styled.h4`
  font-family: ${Font.family};
  font-size: 2.4rem;
  font-weight: ${Font.weight.bold};
  line-height: 1.3;
  color: var(${UI.COLOR_NEUTRAL_0});
  margin: 2rem 0 1rem;

  ${Media.upToMedium()} {
    font-size: 2.2rem;
    margin: 1.6rem 0 0.8rem;
  }
`

// Component definitions outside render to avoid recreation on every render
const CustomH1 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <StyledH1 {...props} id={slugify(getTextFromChildren(children))}>
    {children}
  </StyledH1>
)

const CustomH2 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <StyledH2 {...props} id={slugify(getTextFromChildren(children))}>
    {children}
  </StyledH2>
)

const CustomH3 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <StyledH3 {...props} id={slugify(getTextFromChildren(children))}>
    {children}
  </StyledH3>
)

const CustomH4 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <StyledH4 {...props} id={slugify(getTextFromChildren(children))}>
    {children}
  </StyledH4>
)

const CustomP = ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>): ReactNode => (
  <p {...props}>{children}</p>
)

const CustomStrong = ({ children, ...props }: HTMLAttributes<HTMLElement>): ReactNode => (
  <strong {...props}>{children}</strong>
)

const CustomA = ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>): ReactNode => {
  // Determine if link is external based on href
  const isExternal = href?.startsWith('http') || href?.startsWith('mailto:')
  const isAnchor = href?.startsWith('#')

  // Apply appropriate attributes based on link type
  const linkProps = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : isAnchor
      ? {} // No special attributes for anchor links
      : { rel: 'noopener' } // Internal links get noopener but no target

  return (
    <a {...props} href={href} {...linkProps}>
      {children}
    </a>
  )
}

/**
 * Component to render CMS markdown content with proper styling
 */
export function CmsContent({ content }: CmsContentProps): ReactNode {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: CustomH1,
        h2: CustomH2,
        h3: CustomH3,
        h4: CustomH4,
        p: CustomP,
        strong: CustomStrong,
        a: CustomA,
        ul: CustomUl,
        ol: CustomOl,
        li: CustomLi,
        table: CustomTable,
        thead: CustomTHead,
        tbody: CustomTBody,
        tr: CustomTr,
        th: CustomTh,
        td: CustomTd,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

/**
 * Extract text content from React children, handling nested elements and arrays
 */
function getTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('')
  }

  if (isValidElement(children)) {
    return getTextFromChildren((children.props as { children?: ReactNode }).children)
  }

  return ''
}

// Track used slugs to prevent collisions
const usedSlugs = new Set<string>()

/**
 * Create a unique slug from text for anchor links
 */
function slugify(text: string): string {
  const baseSlug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  if (!baseSlug) return 'heading' // Fallback for empty slugs

  let uniqueSlug = baseSlug
  let counter = 1

  // Handle collisions by appending numbers
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }

  usedSlugs.add(uniqueSlug)
  return uniqueSlug
}
