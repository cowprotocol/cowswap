import styled from 'styled-components/macro'

import { CloseIcon as CloseIconOriginal } from 'common/pure/CloseIcon'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0 0.5rem 0;
`

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
`

export const HookList = styled.ul`
  max-width: 100%;
  list-style: none;
  padding: 0 10px 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.8rem;
`

export const CloseIcon = styled(CloseIconOriginal)`
  position: absolute;
  top: 0;
  right: 0;
`
