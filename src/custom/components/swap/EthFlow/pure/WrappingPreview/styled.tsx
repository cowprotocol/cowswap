import styled from 'styled-components/macro'

export const WrapCardWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 8px;

  > img {
    width: 32px;
    height: 32px;
    margin: 0 0 14px;
    box-shadow: none;
  }
`

export const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: center;
  margin: 0 0 4px;
  font-size: 13px;
  width: 100%;
`

export const WrappingPreviewContainer = styled.div`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  margin: 12px 0;
  width: 100%;
  min-height: 140px;
  overflow: hidden;

  > ${WrapCardWrapper} {
    border: 1px solid ${({ theme }) => theme.bg2};
    &:nth-of-type(1) {
      background-color: ${({ theme }) => theme.bg1};
      border-radius: 16px 0 0 16px;
    }

    &:nth-of-type(2) {
      color: ${({ theme }) => theme.text2};
      background-color: ${({ theme }) => theme.bg2};
      border-radius: 0 16px 16px 0;
    }

    > ${BalanceLabel}:last-of-type {
      margin: 0;
      font-size: 12px;
    }
  }

  // arrow
  > svg {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    background: ${({ theme }) => theme.white};
    width: 24px;
    height: 24px;
    border-radius: 24px;
    padding: 3px;
  }
`
