'use client'

import type { ImgHTMLAttributes, ReactNode } from 'react'

import { Media } from '@cowprotocol/ui'

import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components/macro'

import { Resource, SharedRichTextComponent } from '../services/cms'

import { LazyImage } from '@/components/LazyImage'
import { Link } from '@/components/Link'
import { ShareBlock } from '@/components/ShareBlock'
import { getCampaignLabel } from '@/const/resources'
import { ArticleContent, ArticleMainTitle, ArticleSubtitleWrapper, BodyContent, Breadcrumbs } from '@/styles/styled'
import { formatDate } from '@/util/formatDate'
import { remarkAllowedHtmlImages, sanitizeCmsMarkdown } from '@/util/markdownHtmlImages'

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || ''

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  width: 100%;
  margin: 24px auto 0;
  gap: 34px;
  max-width: 1760px;

  ${Media.upToMedium()} {
    margin: 0 auto;
    gap: 24px;
  }
`

interface ResourcePageComponentProps {
  resource: Resource
}

export function ResourcePageComponent({ resource }: ResourcePageComponentProps): ReactNode {
  const attributes = resource.attributes
  const title = attributes?.title
  const campaign = attributes?.campaign
  const blocks = attributes?.blocks
  const publishedAt = attributes?.publishedAt
  const publishDate = attributes?.publishDate || null
  const publishDateVisible = attributes?.publishDateVisible ?? true
  const description = attributes?.description || ''
  const content =
    blocks?.map((block: SharedRichTextComponent) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
  const pathname = usePathname()
  const fallbackUrl = buildFallbackUrl(pathname)
  const shareTitle = title || 'CoW DAO Resource'

  if (!campaign || !attributes?.slug) {
    return null
  }

  const campaignLabel = getCampaignLabel(campaign)
  const dateIso = publishDate || publishedAt || ''
  const date = dateIso ? new Date(dateIso) : null
  const showDate = Boolean(publishDateVisible && date && !Number.isNaN(date.getTime()))
  const formattedDate = showDate && date ? formatDate(date) : null

  return (
    <Wrapper>
      <ArticleContent>
        <Breadcrumbs>
          <Link href="/">Home</Link>
          <Link href="/resources">Resources</Link>
          <Link href={`/resources/${campaign}`}>{campaignLabel}</Link>
          <span>{title}</span>
        </Breadcrumbs>

        <ArticleMainTitle>{title}</ArticleMainTitle>

        <ArticleSubtitleWrapper>
          {description && <div>{description}</div>}
          {formattedDate && (
            <>
              {description && <div>·</div>}
              <div>
                <span>Published {formattedDate}</span>
              </div>
            </>
          )}
        </ArticleSubtitleWrapper>

        <BodyContent>
          {blocks?.map((block) =>
            isRichTextComponent(block) ? <ResourceRichText key={block.id} sharedRichText={block} /> : null,
          )}
          <ShareBlock url={fallbackUrl} title={shareTitle} onShare={() => undefined} />
        </BodyContent>
      </ArticleContent>
    </Wrapper>
  )
}

function buildFallbackUrl(pathname: string): string {
  if (!SITE_ORIGIN) return ''
  try {
    return new URL(pathname, SITE_ORIGIN).toString()
  } catch {
    return ''
  }
}

function isRichTextComponent(block: unknown): block is SharedRichTextComponent {
  return (
    typeof block === 'object' &&
    block !== null &&
    'body' in block &&
    typeof (block as { body?: unknown }).body === 'string'
  )
}

function MarkdownImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>): ReactNode {
  const dataSrc = (props as Record<string, unknown>)['data-src']
  const resolvedSrc = typeof dataSrc === 'string' ? dataSrc : src
  if (!resolvedSrc) return null
  return <LazyImage src={resolvedSrc} alt={alt || ''} {...props} width={725} height={400} />
}

function ResourceRichText({ sharedRichText }: { sharedRichText: SharedRichTextComponent }): ReactNode {
  const content = sanitizeCmsMarkdown(sharedRichText.body || '')

  return (
    <ReactMarkdown skipHtml remarkPlugins={[remarkAllowedHtmlImages]} components={{ img: MarkdownImage }}>
      {content}
    </ReactMarkdown>
  )
}
