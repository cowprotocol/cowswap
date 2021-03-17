import React from 'react'
import styled from 'styled-components'
import Version from 'components/Version'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 420px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 30px;
  /* padding: 1rem; */
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <BodyWrapper className={className}>
      {children}
      <Version />
    </BodyWrapper>
  )
}
