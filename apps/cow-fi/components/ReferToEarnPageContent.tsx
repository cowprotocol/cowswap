'use client'

import type { ReactNode } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { ContentPageLayout } from '@/components/ContentPageLayout'

export function ReferToEarnPageContent({ title, content }: { title: string; content: string }): ReactNode {
  return (
    <ContentPageLayout title={title} variant="careers">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </ContentPageLayout>
  )
}
