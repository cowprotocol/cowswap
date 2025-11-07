import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Section = styled.div`
  padding: 8px 0 12px;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
  margin-bottom: 8px;
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  margin-bottom: 4px;
`

export const Title = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const List = styled.div`
  display: flex;
  flex-direction: column;
`
