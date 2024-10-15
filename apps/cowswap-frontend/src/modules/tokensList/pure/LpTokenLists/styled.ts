import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
`
export const ListWrapper = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  overflow: auto;

  ${({ theme }) => theme.colorScrollbar};
`

export const ListInner = styled.div`
  width: 100%;
  position: relative;
`

export const ListScroller = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`
