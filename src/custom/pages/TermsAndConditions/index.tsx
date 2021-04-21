import React from 'react'
import content from './TermsAndConditions.md'
import MarkdownPage from '@src/custom/components/MarkdownPage'

export default function TermsAndConditions() {
  return <MarkdownPage content={content} />
}
