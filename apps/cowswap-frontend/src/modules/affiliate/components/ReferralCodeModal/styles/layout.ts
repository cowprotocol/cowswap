import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_PAPER});
`

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 10px 0;
  gap: 10px;
`

export const Illustration = styled.img`
  --size: 100px;
  align-self: center;
  width: auto;
  height: var(--size);
  display: block;
  object-fit: contain;
  margin: 0 0 24px;
`

export const Title = styled.h2`
  margin: 0 auto 16px;
  width: 100%;
  max-width: 260px;
  padding: 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  text-align: center;
`

export const Subtitle = styled.p`
  margin: 0 auto 24px;
  width: 100%;
  max-width: 80%;
  font-size: 15px;
  line-height: 1.5;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: center;

  a {
    color: var(${UI.COLOR_LINK});
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

export const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 0 8px;
  width: 100%;
`

export const Label = styled.label`
  font-size: var(${UI.FONT_SIZE_NORMAL});
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
`
