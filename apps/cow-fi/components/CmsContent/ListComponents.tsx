import type { ReactNode, HTMLAttributes, OlHTMLAttributes, LiHTMLAttributes } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const StyledUl = styled.ul`
  margin: 1.6rem 0 2.4rem;
  padding-left: 2.4rem;

  li {
    margin-bottom: 0.8rem;
    font-size: 1.8rem;
    line-height: 1.6;
    color: var(${UI.COLOR_NEUTRAL_0});

    &:last-child {
      margin-bottom: 0;
    }

    &::marker {
      color: var(${UI.COLOR_NEUTRAL_0});
    }
  }

  ul,
  ol {
    margin: 0.8rem 0 0;
    padding-left: 1.6rem;
  }
`

const StyledOl = styled.ol`
  margin: 1.6rem 0 2.4rem;
  padding-left: 2.4rem;

  &[type='a'] {
    list-style-type: lower-alpha;
  }

  &[type='A'] {
    list-style-type: upper-alpha;
  }

  &[type='i'] {
    list-style-type: lower-roman;
  }

  &[type='I'] {
    list-style-type: upper-roman;
  }

  li {
    margin-bottom: 0.8rem;
    font-size: 1.8rem;
    line-height: 1.6;
    color: var(${UI.COLOR_NEUTRAL_0});

    &:last-child {
      margin-bottom: 0;
    }

    &::marker {
      color: var(${UI.COLOR_NEUTRAL_0});
      font-weight: 600;
    }
  }

  ul,
  ol {
    margin: 0.8rem 0 0;
    padding-left: 1.6rem;
  }
`

export const CustomUl = ({ children, ...props }: HTMLAttributes<HTMLUListElement>): ReactNode => (
  <StyledUl {...props}>{children}</StyledUl>
)

export const CustomOl = ({ children, ...props }: OlHTMLAttributes<HTMLOListElement>): ReactNode => (
  <StyledOl {...props}>{children}</StyledOl>
)

export const CustomLi = ({ children, ...props }: LiHTMLAttributes<HTMLLIElement>): ReactNode => (
  <li {...props}>{children}</li>
)
