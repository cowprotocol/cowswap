import { css } from 'styled-components'

export const ArrowIconCSS = css`
  .arrow {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: ${({ theme }): string => `5px solid ${theme.grey}`};
    transform: rotate(180deg);
    transition: transform 0.1s linear;
    &.open {
      transform: rotate(0deg);
      transition: transform 0.1s linear;
    }
  }
`
