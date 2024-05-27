import styled from 'styled-components/macro'

const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

export const CenteredDots = styled(Dots)<{ smaller?: boolean }>`
  vertical-align: ${({ smaller = false }) => (smaller ? 'normal' : 'super')};
`
