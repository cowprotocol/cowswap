import styled from 'styled-components/macro'

export const WrapCardWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 16px;

  > img {
    width: 42px;
    height: 42px;
    margin: 0 0 14px;
    box-shadow: none;
  }
`

export const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: center;
  margin: 0 0 6px;
  font-size: 15px;
  width: 100%;
  word-break: break-all;
  text-align: center;
  padding: 0 10px;
`

export const WrappingPreviewContainer = styled.div`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  margin: 12px 0;
  width: 100%;
  min-height: 140px;
  overflow: hidden;

  > ${WrapCardWrapper} {
    border: 1px solid ${({ theme }) => theme.bg3};

    &:nth-of-type(1) {
      background-color: ${({ theme }) => theme.bg1};
      border-radius: 16px 0 0 16px;
      border-right: 0;
    }

    &:nth-of-type(2) {
      color: ${({ theme }) => theme.text1};
      background-color: ${({ theme }) => theme.grey1};
      border: 1px solid ${({ theme }) => theme.grey1};
      border-radius: 0 16px 16px 0;
    }

    > ${BalanceLabel}:last-of-type {
      margin: 0;
      font-size: 13px;
      opacity: 0.8;
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
    background: ${({ theme }) => theme.grey1};
    stroke: ${({ theme }) => theme.text1};
    width: 32px;
    height: 32px;
    border-radius: 32px;
    padding: 5px;
  }
`
