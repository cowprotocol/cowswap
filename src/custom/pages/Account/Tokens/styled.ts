import { ChevronDown } from 'react-feather'
import { lighten } from 'polished'
import styled from 'styled-components/macro'
import { Content } from 'components/Page'
import { PageWrapper } from 'components/Page'
import { ThemedText, MEDIA_WIDTHS } from 'theme'
import { Card } from 'pages/Account/styled'

export const MenuWrapper = styled.div`
  position: relative;
`

export const MenuButton = styled.button`
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;
`

export const StyledChevronDown = styled(ChevronDown)`
  margin-left: 5px;
  font-sze: 14px;
`

export const Menu = styled.div`
  border-radius: 2px;
  background: ${({ theme }) => theme.bg5};
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  bottom: 0;
  transform: translateY(105%);
  max-width: 400px;
  min-width: 250px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  z-index: 99;
`

export const MenuItem = styled.div`
  transition: background 0.2s ease-in;
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;

  :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.disabled};
  }

  :hover {
    background: ${({ theme }) => lighten(0.05, theme.bg5)};
  }
`

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 160px auto;
  flex-direction: column;

  margin: 0 1rem;
  max-width: ${MEDIA_WIDTHS.upToLarge}px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    max-width: ${MEDIA_WIDTHS.upToMedium}px;
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: ${MEDIA_WIDTHS.upToSmall}px;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: ${MEDIA_WIDTHS.upToExtraSmall}px;
    display: flex;
    flex-flow: column wrap;
  `}

  h2 {
    color: ${({ theme }) => theme.primary1};
  }

  > div:not(:first-child) {
    margin: 2rem 0;
  }

  ${Content} {
    > div > ul {
      margin: 12px 0 24px;
      padding: 0 0 0 20px;
      color: ${({ theme }) => theme.primary1};
      line-height: 1.2;
    }

    > div > ul > li {
      margin: 0 0 12px;
    }

    > h3 {
      margin: 0;

      ::before {
        border-top: none;
      }
    }
  }

  ol > li {
    margin-bottom: 0.5rem;
  }
`

export const AccountPageWrapper = styled(PageWrapper)`
  width: 100%;
  max-width: 100%;
  border: none;
  background: none;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0;
    padding: 0;
    margin-top: 1rem;
  `};
`

export const Subtitle = styled(ThemedText.MediumHeader)`
  font-size: 1.1rem !important;
`

export const MainText = styled(ThemedText.Main)`
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
`

export const AccountCard = styled(Card)`
  min-height: auto;
  margin-bottom: 1rem;
`

export const AccountHeading = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
`

export const RemoveTokens = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary1};
  cursor: pointer;
`
