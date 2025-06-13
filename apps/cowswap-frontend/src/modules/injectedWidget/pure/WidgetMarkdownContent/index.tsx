import { ReactNode } from 'react'

import ReactMarkdown, { Components } from 'react-markdown'

interface ExternalLinkProps {
  href: string
  children: ReactNode
  className?: string
}

// Any link in widget should be opened in new tab
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ExternalLink(props: ExternalLinkProps) {
  return (
    <a {...props} target="_blank">
      {props.children}
    </a>
  )
}

const components = { a: ExternalLink } as Components

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WidgetMarkdownContent({ children }: { children?: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>
}
