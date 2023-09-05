import { ExternalLink } from '@cowswap/ui'

import styled from 'styled-components/macro'

export const ReadMoreLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.text1};
  text-decoration: underline;
`
