import React from 'react'
import { Trans } from '@lingui/macro'
import { RowFixed } from 'components/Row'
import { IconWrapper, TYPE } from 'theme'
import { Edit } from 'react-feather'
import { CurrencySearch as CurrencySearchMod, CurrencySearchProps } from './CurrencySearchMod'
import { DefaultTheme } from 'styled-components'

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
