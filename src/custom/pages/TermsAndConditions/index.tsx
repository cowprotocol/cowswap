import React from 'react'
import content from './TermsAndConditions.md'
import MarkdownPage from 'components/MarkdownPage'

export default function TermsAndConditions() {
  return <MarkdownPage content={content} />
}
