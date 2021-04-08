import React from 'react'
import ReactMarkdown from 'react-markdown'
import useFetchFile from '../../hooks/useFetchFile'
import { Title, Content, AppBodyMod } from './About.styled'
import content from './About.md'

export default function About() {
  const { file, error } = useFetchFile(content)

  return (
    <AppBodyMod>
      <Title>About</Title>
      <Content>{file && <ReactMarkdown>{error ? error : file}</ReactMarkdown>}</Content>
    </AppBodyMod>
  )
}
