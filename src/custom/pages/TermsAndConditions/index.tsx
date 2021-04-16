import React from 'react'
import content from './TermsAndConditions.md'
import Markdown from 'components/Markdown'

export default function TermsAndConditions() {
  return <Markdown content={content} />
}
