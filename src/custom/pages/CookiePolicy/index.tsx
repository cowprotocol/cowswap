import React from 'react'
import content from './CookiePolicy.md'
import MarkdownPage from '@src/custom/components/MarkdownPage'

export default function CookiePolicy() {
  return <MarkdownPage content={content} />
}
