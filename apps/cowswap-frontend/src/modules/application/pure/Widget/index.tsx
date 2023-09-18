import styled from 'styled-components/macro'

import { BodyWrapper as BodyWrapperMod } from 'legacy/pages/AppBody'

import { UI } from 'common/constants/theme'

const Wrapper = styled(BodyWrapperMod)`
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border: 0;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.swap};
`

export interface AppBodyProps {
  children: React.ReactNode
  className?: string
}

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export function Widget({ children, className }: AppBodyProps) {
  return <Wrapper className={className}>{children}</Wrapper>
}
