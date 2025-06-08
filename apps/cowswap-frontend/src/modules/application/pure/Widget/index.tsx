import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

import { BodyWrapper as BodyWrapperMod } from 'legacy/pages/AppBody'

const Wrapper = styled(BodyWrapperMod)`
  background: var(${UI.COLOR_PAPER});
  border: 0;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
  max-width: ${WIDGET_MAX_WIDTH.swap};
`

export interface AppBodyProps {
  children: React.ReactNode
  className?: string
}

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Widget({ children, className }: AppBodyProps) {
  return <Wrapper className={className}>{children}</Wrapper>
}
