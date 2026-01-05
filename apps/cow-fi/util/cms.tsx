import type { ReactNode } from 'react'

import ReactMarkdown from 'react-markdown'

import { Page } from '../services/cms'

export interface RichTextSection {
  __component: 'sections.rich-text'
  id: number
  content?: string
}

/**
 * Extract rich text content from CMS page data
 */
export function extractRichTextContent(page: Page): string {
  if (!page.attributes?.contentSections) return ''

  // Find the rich text sections and combine their content
  const richTextSections = page.attributes.contentSections.filter(
    (section): section is RichTextSection => section.__component === 'sections.rich-text',
  )

  return richTextSections.map((section) => section.content || '').join('\n\n')
}

/**
 * Render markdown content with appropriate styling
 */
export function renderMarkdownContent(content: string): ReactNode {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
        h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
        h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
        h4: ({ children }) => <h4 id={slugify(String(children))}>{children}</h4>,
        p: ({ children, className }) => <p className={className}>{children}</p>,
        strong: ({ children }) => <strong>{children}</strong>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="nofollow noopener">
            {children}
          </a>
        ),
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
