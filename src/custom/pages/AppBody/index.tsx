import React from 'react'
import styled from 'styled-components/macro'
import { BodyWrapper as BodyWrapperMod } from '@src/pages/AppBody'

export const BodyWrapper = styled(BodyWrapperMod)`
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.appBody.boxShadow};
  border-radius: ${({ theme }) => theme.appBody.borderRadius};
  border: ${({ theme }) => theme.appBody.border};
  padding: ${({ theme }) => theme.appBody.padding};
  max-width: ${({ theme }) => theme.appBody.maxWidth.normal};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <BodyWrapper className={className}>{children}</BodyWrapper>
}
