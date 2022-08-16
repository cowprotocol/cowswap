import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'
import { Content } from 'components/Page'
import { PageWrapper } from 'components/Page'
import { ThemedText, MEDIA_WIDTHS } from 'theme'
import { Card } from 'pages/Account/styled'
import { darken } from 'polished'

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
  padding: 0;
`

export const StyledChevronDown = styled(ChevronDown)`
  margin-left: 5px;
  font-sze: 14px;
`

export const Menu = styled.div`
  border-radius: 16px;
  background: ${({ theme }) => (theme.darkMode ? darken(0.09, theme.bg5) : theme.bg4)};
  box-shadow: 0 12px 18px ${({ theme }) => theme.bg5};
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  bottom: 0;
  transform: translateY(105%);
  max-width: 400px;
  min-width: 250px;
  z-index: 99;
  padding: 12px;
`

export const MenuItem = styled.div<{ active: boolean }>`
  transition: background 0.2s ease-in;
  background-color: ${({ active, theme }) => (active ? theme.primary1 : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.text2 : theme.text1)};
  justify-content: space-between;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  display: flex;

  :not(:last-child) {
    margin-bottom: 5px;
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

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
  `}
`

export const RemoveTokens = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary1};
  cursor: pointer;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-top: 5px;
    padding: 0;
  `}
`

export const WrongNetwork = styled.div`
  max-width: 200px;
`

export const LeftSection = styled.div`
  display: flex;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
    align-items: flex-start;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: center;
    align-items: center;
    width: 100%;
  `};
`

export const ClearSearchInput = styled.div`
  position: absolute;
  right: 10px;
  top: 40%;
  transform: translateY(-50%);
  cursor: pointer;
`
