import React from 'react'

import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { DARK_COLOURS } from 'theme'

import Tabs, {
  getTabTheme,
  Props as TabsProps,
  IndicatorTabSize,
} from '../../../../components/common/Tabs/Tabs'

const StyledTabs = styled.div`
  display: flex;
  width: 100%;
  padding: 0;
  border: ${({ theme }): string => `1px solid ${theme.borderPrimary}`};
  border-radius: 4px;

  .tab-content {
    position: relative;
    padding: 0;
    width: 100%;
    max-width: 100%;
  }

  .tab-extra-content {
    margin: 0 0 0 auto;
    display: flex;
    justify-content: flex-end;

    ${Media.upToSmall()} {
      order: -1;
      width: 100%;
      justify-content: space-between;
    }
  }

  ${Media.upToMedium()} {
    border: none;
  }
`
const tabCustomThemeConfig = getTabTheme({
  activeBg: 'var(--color-transparent)',
  activeBgAlt: 'initial',
  inactiveBg: 'var(--color-transparent)',
  activeText: DARK_COLOURS.textPrimary1,
  inactiveText: 'var(--color-text-secondary2)',
  activeBorder: DARK_COLOURS.orange,
  inactiveBorder: 'none',
  fontSize: 'var(--font-size-large)',
  fontWeight: 'var(--font-weight-bold)',
  letterSpacing: 'initial',
  borderRadius: false,
  indicatorTabSize: IndicatorTabSize.big,
})

type ExplorerTabsProps = Omit<TabsProps, 'tabTheme'> & { extraPosition?: 'top' | 'bottom' }

const ExplorerTabs: React.FC<ExplorerTabsProps> = (props) => {
  return (
    <StyledTabs className={props.className}>
      <Tabs tabTheme={tabCustomThemeConfig} {...props} />
    </StyledTabs>
  )
}

export default ExplorerTabs
