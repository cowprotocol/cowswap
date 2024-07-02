import { ButtonSecondary, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const LoaderContainer = styled(ButtonSecondary)`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;

  &[disabled] {
    cursor: default;
    background: var(--cow-color-lightBlue-opacity-90);
  }
`

export const LoadingMessage = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
`

export const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  width: 100%;
  align-items: center;
  justify-content: center;
`

export const SelectWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 8px 0 0;
  gap: 8px;

  ${Media.upToSmall()} {
    flex-flow: column wrap;

    ${ButtonSecondary} {
      width: 100%;
    }
  }
`

export const TextWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin: 0 0 24px;
  font-size: 14px;
`
