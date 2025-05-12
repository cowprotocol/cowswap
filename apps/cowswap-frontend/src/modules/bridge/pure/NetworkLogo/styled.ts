import styled from 'styled-components/macro'

export const NetworkLogoWrapper = styled.div<{ size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 4px;

  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`
