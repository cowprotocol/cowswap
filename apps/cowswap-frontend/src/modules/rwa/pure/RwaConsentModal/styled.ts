import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
  overflow: auto;
`

export const Contents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
`

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: inherit;

  p {
    margin: 0;
  }
`

export const AcknowledgementSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0;

  p {
    margin: 0;
    font-weight: 500;
  }
`

export const BulletList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;

  li {
    margin: 0;
    line-height: 1.5;
  }
`

export const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`

