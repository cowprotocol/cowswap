import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`

export const InnerWrapper = styled.div<{ $hasSidebar: boolean }>`
  min-height: min(600px, 100%);
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  flex-direction: ${({ $hasSidebar }) => ($hasSidebar ? 'row' : 'column')};
`

export const ModalContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  height: 100%;
`
