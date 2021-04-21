import React from 'react'
import content from './PrivacyPolicy.md'
import MarkdownPage from 'components/MarkdownPage'
import { GdocsListStyle } from 'components/Page'
import styled from 'styled-components'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
`

export default function PrivacyPolicy() {
  return <Wrapper content={content} />
}
