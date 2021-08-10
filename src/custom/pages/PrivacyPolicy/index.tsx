import React from 'react'
import contentFile from './PrivacyPolicy.md'
import { MarkdownPage } from 'components/Markdown'
import { GdocsListStyle } from 'components/Page'
import styled from 'styled-components'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
`

export default function PrivacyPolicy() {
  return <Wrapper contentFile={contentFile} />
}
