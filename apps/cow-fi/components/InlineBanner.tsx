import React from 'react'
import styled from 'styled-components'
import { Color, Font } from 'styles/variables'
import { darken, transparentize } from 'polished'

const Wrapper = styled.div<{ type?: 'alert' | 'info' }>`
  display: flex;
  width: 100%;
  color: ${({ type }) => (type === 'info' ? darken(0.3, Color.information) : darken(0.3, Color.alert))};
  background: ${({ type }) =>
    type === 'info' ? transparentize(0.75, Color.information) : transparentize(0.75, Color.alert)};
  padding: 2.1rem 1.6rem;
  border-radius: 1rem;
  margin: 0 0 2rem;
  line-height: 1.2;

  a {
    color: ${Color.darkBlue};
    font-weight: ${Font.weightMedium};
    text-decoration: underline;
  }
`

interface InlineBannerProps {
  content: React.ReactNode
  type?: 'alert' | 'info'
}

export function InlineBanner({ content }: InlineBannerProps) {
  return <Wrapper>{content}</Wrapper>
}
