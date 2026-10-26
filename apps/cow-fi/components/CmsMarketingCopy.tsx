'use client'

import type { ReactNode, AnchorHTMLAttributes } from 'react'
import { createContext, useContext } from 'react'

import { UI } from '@cowprotocol/ui'

import ReactMarkdown from 'react-markdown'
import styled from 'styled-components/macro'

import { Link } from '@/components/Link'
import { DisclaimerList, SectionTitleDescription } from '@/styles/styled'

interface CopyLinkTracking {
  links: Record<string, { action: string; utmContent: string }>
  sendEvent: (action: string) => void
}

const LinkTrackingContext = createContext<CopyLinkTracking | undefined>(undefined)

function CopyLink({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>): ReactNode {
  const tracking = useContext(LinkTrackingContext)
  const link = href ? tracking?.links[href] : undefined
  return (
    <Link
      href={href}
      external={Boolean(href && /^(https?:|mailto:)/i.test(href))}
      utmContent={link?.utmContent}
      onClick={link ? () => tracking?.sendEvent(link.action) : undefined}
    >
      {children}
    </Link>
  )
}

function InlineParagraph({ children }: { children?: ReactNode }): ReactNode {
  return <>{children}</>
}

function NoticeParagraph({ children }: { children?: ReactNode }): ReactNode {
  return (
    <SectionTitleDescription
      fontSize={16}
      fontSizeMobile={14}
      color={`var(${UI.COLOR_NEUTRAL_40})`}
      textAlign="left"
      margin="8px 0"
    >
      {children}
    </SectionTitleDescription>
  )
}

const INLINE_ELEMENTS = ['p', 'a', 'strong', 'em', 'br']
const INLINE_COMPONENTS = { p: InlineParagraph, a: CopyLink }
const NOTICE_COMPONENTS = { p: NoticeParagraph, ul: DisclaimerList, a: CopyLink }

const FaqCopyWrapper = styled.div`
  p {
    font-size: inherit;
    line-height: inherit;
  }

  > :first-child {
    margin-top: 0;
  }
  > :last-child {
    margin-bottom: 0;
  }
`

export function CmsFaqCopy({ content, tracking }: { content: string; tracking: CopyLinkTracking }): ReactNode {
  return (
    <LinkTrackingContext.Provider value={tracking}>
      <FaqCopyWrapper>
        <ReactMarkdown components={{ a: CopyLink }}>{content}</ReactMarkdown>
      </FaqCopyWrapper>
    </LinkTrackingContext.Provider>
  )
}

export function CmsInlineCopy({ content, tracking }: { content: string; tracking?: CopyLinkTracking }): ReactNode {
  return (
    <LinkTrackingContext.Provider value={tracking}>
      <ReactMarkdown allowedElements={INLINE_ELEMENTS} unwrapDisallowed components={INLINE_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </LinkTrackingContext.Provider>
  )
}

export function CmsNoticeCopy({ content }: { content: string }): ReactNode {
  return <ReactMarkdown components={NOTICE_COMPONENTS}>{content}</ReactMarkdown>
}
