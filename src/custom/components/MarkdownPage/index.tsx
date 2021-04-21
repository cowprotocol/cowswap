import React, { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import { ReactMarkdownPropsBase } from 'react-markdown'
import useFetchFile from 'hooks/useFetchFile'
import { HeadingRenderer, LinkRenderer } from './renderers'
import Page, { Title, Content } from 'components/Page'
import styled from 'styled-components'
import { WithClassName } from 'types'
// import ScrollToTop from '../ScrollToTop'

interface MarkdownParams extends WithClassName {
  content: string
  title?: ReactNode
}

export const Wrapper = styled(Page)``

const CustomReactMarkdown = (props: ReactMarkdownPropsBase & { children: string }) => (
  <ReactMarkdown {...props} renderers={{ heading: HeadingRenderer, link: LinkRenderer }} allowDangerousHtml />
)

export default function Markdown({ content, title, className }: MarkdownParams) {
  const { error, file } = useFetchFile(content)
  return (
    <Wrapper className={className}>
      {title && <Title>{title}</Title>}
      <Content>
        {file && <CustomReactMarkdown>{file}</CustomReactMarkdown>}
        {error && <CustomReactMarkdown>{error}</CustomReactMarkdown>}
      </Content>
      {/* <ScrollToTop
        styleProps={{
          bottom: '8.8%',
          right: 'calc(50% - 4.6rem)',
          background: '#9bd7c2'
        }}
      /> */}
    </Wrapper>
  )
}
