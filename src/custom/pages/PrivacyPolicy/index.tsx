import React from 'react'
import content from './PrivacyPolicy.md'
import MarkdownPage from '@src/custom/components/MarkdownPage'

export default function PrivacyPolicy() {
  return <MarkdownPage content={content} />
}
