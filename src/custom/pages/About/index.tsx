import React from 'react'
import useMarkdown from '../../hooks/useMarkdown'
import { Title, Content, AppBodyMod } from './About.styled'
import markdownContent from './about.md'
import ReactMarkdown from 'react-markdown'

export default function About() {
  return (
    <AppBodyMod>
      <Title>About</Title>
      <Content>
        <ReactMarkdown>{useMarkdown(markdownContent)}</ReactMarkdown>
      </Content>
    </AppBodyMod>
  )
}
