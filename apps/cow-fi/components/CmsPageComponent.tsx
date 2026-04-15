'use client'

import type { ReactNode } from 'react'

import { Page } from '../services/cms'
import { extractRichTextContent } from '../util/cms'

import { CmsContent } from '@/components/CmsContent'
import { ContentPageLayout } from '@/components/ContentPageLayout'

interface CmsPageComponentProps {
  page: Page
}

export function CmsPageComponent({ page }: CmsPageComponentProps): ReactNode {
  const content = extractRichTextContent(page)
  const title = page.attributes?.heading

  if (!title) {
    throw new Error(`No heading found for page`)
  }

  return (
    <ContentPageLayout title={title}>
      <CmsContent content={content} />
    </ContentPageLayout>
  )
}
