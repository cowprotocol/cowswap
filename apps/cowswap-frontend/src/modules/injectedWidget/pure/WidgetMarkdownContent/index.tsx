import { ReactNode } from 'react'

import ReactMarkdown, { Components } from 'react-markdown'

interface ExternalLinkProps {
  href: string
  children: ReactNode
  className?: string
}

// Any link in widget should be opened in new tab
function ExternalLink(props: ExternalLinkProps) {
  return (
    <a {...props} target="_blank">
      {props.children}
    </a>
  )
}

const components = { a: ExternalLink } as Components

export function WidgetMarkdownContent({ children }: { children?: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>
}
