import React from 'react'
import content from './CookiePolicy.md'
import Markdown from 'components/Markdown'

export default function CookiePolicy() {
  return <Markdown content={content} />
}
