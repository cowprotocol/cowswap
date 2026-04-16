import styled from 'styled-components/macro'

export const SimpleStyledText = styled.div`
  & p,
  & ul,
  & ol,
  & li {
    margin: 0;
  }

  & ul,
  & ol {
    padding-left: 16px;
  }

  /* Spacing between adjacent block siblings (any depth) */
  & p + p,
  & ul + ul,
  & ol + ol,
  & p + ul,
  & p + ol,
  & ul + p,
  & ol + p,
  & li + li {
    margin-top: 8px;
  }
`
