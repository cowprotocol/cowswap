import styled from 'styled-components'
import AppBody from 'pages/AppBody'

export const AppBodyMod = styled(AppBody)`
  padding: 0 24px 24px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.content};
`

export const Title = styled.h1`
  font-size: 32px;
`

export const Content = styled.div`
  font-size: 15px;
  margin: 0 0 28px;
  display: block;

  > h2 {
    font-size: 18px;
  }

  > h2:not(:first-of-type)::before {
    content: '';
    display: block;
    border-top: 1px solid ${({ theme }) => theme.border};
    margin: 24px 0;
    opacity: 0.2;
  }

  > p {
    line-height: 1.5;
  }

  > ul > li {
    margin: 0 0 10px;
  }
`
