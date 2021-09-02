import styled from 'styled-components'
import Page, { GdocsListStyle } from 'components/Page'

export const Wrapper = styled(Page)`
  ${GdocsListStyle}

  max-width: 1000px;
  padding-top: 1rem;

  span[role='img'] {
    font-size: 1.8em;
  }
`

export const StyledWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: center;
  border-radius: 1.3rem;
  padding: 0.93rem;
  margin: 1.25rem 0;
  border: ${({ theme }) => theme.appBody.border};
`
export const StyledSmallBtn = styled.a`
  width: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.bg6};
  margin-left: 0.75rem;
  svg {
    fill: ${({ theme }) => theme.text4};
    font-size: 1rem;
  }
`
