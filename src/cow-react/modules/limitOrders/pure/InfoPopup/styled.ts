import styled from 'styled-components/macro'
import { X } from 'react-feather'

export const InfoPopup = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  gap: 15px;
  background: ${({ theme }) => theme.bg1};
  margin-top: 15px;
  border-radius: 18px;
  padding: 15px 25px 15px 15px;
`

export const CloseIcon = styled(X)`
  position: absolute;
  right: 12px;
  top: 12px;
  cursor: pointer;
`
