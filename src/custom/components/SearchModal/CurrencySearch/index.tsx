import React from 'react'
import { Trans } from '@lingui/macro'
import { RowFixed } from 'components/Row'
import { IconWrapper, TYPE } from 'theme'
import styled from 'styled-components/macro'
import { Edit } from 'react-feather'
import { CurrencySearch as CurrencySearchMod, CurrencySearchProps } from './CurrencySearchMod'
import { DefaultTheme } from 'styled-components'
import { SearchInput, Separator } from '@src/components/SearchModal/styleds'
import { transparentize } from 'polished'
import Column from '@src/components/Column'

export const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;

  ${SearchInput} {
    border: 1px solid ${({ theme }) => transparentize(0.7, theme.text1)}};
  }

  ${SearchInput}:focus {
    border-color: ${({ theme }) => theme.primary1}};
  }

  ${SearchInput}::placeholder {
    color: ${({ theme }) => transparentize(0.5, theme.text1)};
  }

  ${Separator} {
    background: ${({ theme }) => transparentize(0.7, theme.text1)};
  }
`

const FooterButtonTextComponent = ({ theme }: { theme: DefaultTheme }) => (
  <RowFixed>
    <IconWrapper size="16px" marginRight="6px" stroke={theme.blue1}>
      <Edit />
    </IconWrapper>
    <TYPE.main color={theme.blue1}>
      <Trans>Manage Token Lists</Trans>
    </TYPE.main>
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
