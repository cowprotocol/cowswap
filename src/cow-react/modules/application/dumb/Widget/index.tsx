import styled from 'styled-components/macro'
import { BodyWrapper as BodyWrapperMod } from '@src/pages/AppBody'

const Wrapper = styled(BodyWrapperMod)`
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  box-shadow: ${({ theme }) => theme.appBody.boxShadow};
  border-radius: ${({ theme }) => theme.appBody.borderRadius};
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.appBody.boxShadow};
  border: ${({ theme }) => theme.appBody.border};
  padding: ${({ theme }) => theme.appBody.padding};
  max-width: ${({ theme }) => theme.appBody.maxWidth.normal};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border: ${({ theme }) => theme.appBody.borderMobile};
    box-shadow: ${({ theme }) => theme.appBody.boxShadowMobile};
  `};
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
