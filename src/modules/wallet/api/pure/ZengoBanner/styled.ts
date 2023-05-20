import styled from 'styled-components/macro'
import { ButtonPrimary } from 'legacy/components/Button'
import { ExternalLink } from 'legacy/theme'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
    justify-content: center;
  `};
`

export const Icon = styled.div`
  max-width: 50px;
  img {
    max-width: 100%;
  }
`

export const Content = styled.div`
  flex: 1;
  padding: 0 1rem;
  color: ${({ theme }) => theme.text1};
  h4 {
    margin-bottom: 5px;
    font-size: 1.1rem;
  }
  p {
    margin: 0;
    font-size: 0.8rem;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 5px;
    text-align: center;
  `};
`

export const Actions = styled.div`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 10px;
    display: flex;
    justify-content: center;
    flex-direction: column;
  `};
`

export const GetZengoButton = styled(ButtonPrimary)`
  font-size: 12px;
  border-radius: 8px;
  padding: 8px;
  min-height: auto;
  a {
    color: ${({ theme }) => theme.white};
    &:hover {
      text-decoration: none;
    }
  }
`

export const HowToUse = styled(ExternalLink)`
  font-size: 0.8rem;
  margin-top: 5px;
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
`
