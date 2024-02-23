import styled from 'styled-components/macro'

const fadeIn = `
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`

export const LongLoadText = styled.span<{ fontSize?: number; fontWeight?: number }>`
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : 'inherit')};
  font-weight: ${({ fontWeight }) => (fontWeight ? `${fontWeight}` : 'inherit')};
  animation: fadeIn 0.42s ease-in;

  ${fadeIn}
`
