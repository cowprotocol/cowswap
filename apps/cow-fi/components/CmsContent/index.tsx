import type { ReactNode } from 'react'
import type { HTMLAttributes, AnchorHTMLAttributes } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { CustomTable, CustomTHead, CustomTBody, CustomTr, CustomTh, CustomTd } from './TableComponents'

interface CmsContentProps {
  content: string
}

// Component definitions outside render to avoid recreation on every render
const CustomH1 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <h1 {...props} id={slugify(String(children))}>{children}</h1>
)

const CustomH2 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <h2 {...props} id={slugify(String(children))}>{children}</h2>
)

const CustomH3 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <h3 {...props} id={slugify(String(children))}>{children}</h3>
)

const CustomH4 = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>): ReactNode => (
  <h4 {...props} id={slugify(String(children))}>{children}</h4>
)

const CustomP = ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>): ReactNode => (
  <p {...props}>{children}</p>
)

const CustomStrong = ({ children, ...props }: HTMLAttributes<HTMLElement>): ReactNode => 
  <strong {...props}>{children}</strong>

const CustomA = ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>): ReactNode => (
  <a {...props} target="_blank" rel="nofollow noopener">
    {children}
  </a>
)


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
 * Create a slug from text for anchor links
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}