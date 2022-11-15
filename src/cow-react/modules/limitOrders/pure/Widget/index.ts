import styled from 'styled-components/macro'

export const Widget = styled.div`
  background: ${({ theme }) => theme.bg1};
  border-radius: ${({ theme }) => theme.appBody.borderRadius};
  box-shadow: ${({ theme }) => theme.appBody.boxShadow};
  border: ${({ theme }) => theme.appBody.border};
  padding: 15px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border: ${({ theme }) => theme.appBody.borderMobile};
    box-shadow: ${({ theme }) => theme.appBody.boxShadowMobile};
  `};
`
