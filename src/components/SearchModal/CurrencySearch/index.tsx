import { Trans } from '@lingui/macro'
import { RowFixed } from 'components/Row'
import { IconWrapper, ThemedText } from 'theme'
import styled from 'styled-components/macro'
import { Edit } from 'react-feather'
import { CurrencySearch as CurrencySearchMod, CurrencySearchProps } from './CurrencySearchMod'
import { DefaultTheme } from 'styled-components/macro'
import { Separator } from 'components/SearchModal/styleds'
import { transparentize } from 'polished'
import Column from 'components/Column'

export const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1 fit-content;
  position: relative;

  > input {
    border: none;
    transition: background 0.3s ease-in-out;
    background: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
  }

  > input::placeholder {
    font-size: 16px;
    color: ${({ theme }) => transparentize(0.4, theme.text1)};
  }

  > input:focus::placeholder {
    color: ${({ theme }) => transparentize(0.9, theme.text1)};
  }

  ${Separator} {
    background: ${({ theme }) => theme.grey1};

    // Target the token list container
    + div {
    }
  }
`

const FooterButtonTextComponent = ({ theme }: { theme: DefaultTheme }) => (
  <RowFixed>
    <IconWrapper size="16px" marginRight="6px" stroke={theme.text1}>
      <Edit />
    </IconWrapper>
    <ThemedText.Main color={theme.text1}>
      <Trans>Manage Token Lists</Trans>
    </ThemedText.Main>
  </RowFixed>
)

export function CurrencySearch(props: Omit<CurrencySearchProps, 'FooterButtonTextComponent'>) {
  return (
    <CurrencySearchMod
      {...props}
      FooterButtonTextComponent={(props: { theme: DefaultTheme }) => <FooterButtonTextComponent {...props} />}
    />
  )
}
