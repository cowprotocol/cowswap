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
  & ol + ol {
    margin-top: 8px;
  }

  /* Direct children: second sibling gets margin */
  & > * + * {
    margin-top: 8px;
  }

  /* One wrapper level (e.g. when Trans/tooltip wraps content) */
  & > * > * + * {
    margin-top: 8px;
  }

  & ul > li + li,
  & ol > li + li {
    margin-top: 8px;
  }
`
