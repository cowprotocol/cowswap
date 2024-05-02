import React from 'react'
import styled from 'styled-components'
import { Color, Font, Media } from 'styles/variables'

const Wrapper = styled.div<{
  maxWidth?: number
  titleFontSize?: number
  titleFontSizeMobile?: number
  bodyFontSize?: number
  bodyFontSizeMobile?: number
  color?: string
}>`
  --titleSize: ${({ titleFontSize }) => (titleFontSize ? `${titleFontSize}rem` : '4.8rem')};
  --color: ${({ color }) => (color ? color : Color.darkBlue)};
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  margin: 2.4rem 0;
  width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}rem` : '100%')};
  font-size: ${({ bodyFontSize }) => (bodyFontSize ? `${bodyFontSize}rem` : '2.4rem')};
  font-weight: ${Font.weightNormal};

  ${Media.mobile} {
    --titleSize: ${({ titleFontSizeMobile }) => (titleFontSizeMobile ? `${titleFontSizeMobile}rem` : '2.8rem')};
    width: 100%;
  }

  a {
    color: var(--color);
    font-weight: inherit;
    text-decoration: underline;
  }

  details {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    margin: 0 auto;
    padding: 0;
    line-height: 1;
    font-size: inherit;
    font-weight: inherit;
    position: relative;

    ${Media.mobile} {
      font-size: 2rem;
    }
  }

  details > summary {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    font-weight: inherit;
    cursor: pointer;
    margin: 0;
    padding: 3.8rem var(--titleSize) 3.8rem 0;
    // same padding but do the var titleSize + 10px
    padding: 3.8rem calc((var(--titleSize) + 1rem)) 3.8rem 0;
    list-style-type: none;
    line-height: 1.2;
    border-bottom: 0.2rem solid var(--color);
    position: relative;
    font-size: var(--titleSize);

    &::marker,
    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: '';
      background: url('/images/cowamm-plus-sign.svg') no-repeat center/contain;
      display: flex;
      align-items: center;
      text-align: center;
      width: var(--titleSize);
      height: var(--titleSize);
      margin: auto;
      position: absolute;
      font-size: inherit;
      right: 0;
      top: 0;
      bottom: 0;
    }
  }

  details > div {
    font-size: ${({ bodyFontSize }) => (bodyFontSize ? `${bodyFontSize}rem` : '2.4rem')};
    line-height: 1.8;
    margin: 0;
    padding: 0 33% 6.2rem 0;

    ${Media.mobile} {
      padding: 0 0 6.2rem;
      font-size: ${({ bodyFontSizeMobile }) => (bodyFontSizeMobile ? `${bodyFontSizeMobile}rem` : '2rem')};
    }
  }

  details[open] > div {
    border-bottom: 0.2rem solid var(--color);
  }

  details[open] > summary {
    border-bottom: 0.2rem solid transparent;
  }

  details[open] > summary::after {
    background: url('/images/cowamm-minus-sign.svg') no-repeat center/contain;
  }
`

interface FAQListProps {
  children: React.ReactNode
  maxWidth?: number
  titleFontSize?: number
  titleFontSizeMobile?: number
  bodyFontSize?: number
  bodyFontSizeMobile?: number
  color?: string
}

export function FAQList({
  children,
  maxWidth,
  titleFontSize,
  titleFontSizeMobile,
  bodyFontSize,
  bodyFontSizeMobile,
  color,
}: FAQListProps) {
  return (
    <Wrapper
      titleFontSize={titleFontSize}
      titleFontSizeMobile={titleFontSizeMobile}
      bodyFontSize={bodyFontSize}
      bodyFontSizeMobile={bodyFontSizeMobile}
      maxWidth={maxWidth}
      color={color}
    >
      {children}
    </Wrapper>
  )
}
