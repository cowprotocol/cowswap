import { Media, UI } from '@cowprotocol/ui'

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
  overflow-y: auto;

  > img {
    width: 100%;
    max-width: 180px;
    height: auto;
    align-self: center;
  }

  ${Media.upToSmall()} {
    > img {
      max-width: 150px;
    }
  }
`

export const Title = styled.h2`
  margin: 0 auto 16px;
  width: 100%;
  max-width: 75%;
  padding: 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  text-align: center;

  ${Media.upToSmall()} {
    font-size: 24px;
    max-width: 100%;
  }
`

export const TitleAccent = styled.span`
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const Subtitle = styled.p`
  margin: 0 auto 24px;
  width: 100%;
  max-width: 80%;
  font-size: 15px;
  line-height: 1.5;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: center;

  ${Media.upToSmall()} {
    font-size: 14px;
    max-width: 90%;
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
