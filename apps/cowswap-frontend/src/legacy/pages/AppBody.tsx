import React from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme'

export const BodyWrapper = styled.main`
  position: relative;
  margin: 0;
  width: 100%;
  background: ${({ theme }) => (theme.darkMode ? '#191B1F' : '#FFF')};
  box-shadow:
    0px 0px 1px rgba(0, 0, 0, 0.01),
    0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
  z-index: ${Z_INDEX.deprecated_content};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function AppBody({ children, ...rest }: { children: React.ReactNode }) {
  return <BodyWrapper {...rest}>{children}</BodyWrapper>
}
