import React from 'react'

import styled from 'styled-components/macro'

import Tabs, {
  getTabTheme,
  Props as TabsProps,
  IndicatorTabSize,
  TabList,
} from '../../../../components/common/Tabs/Tabs'
import { DARK_COLOURS } from '../../../../theme'
import { media } from '../../../../theme/styles/media'

const StyledTabs = styled.div`
  display: flex;
  width: 100%;
  padding: 0;
  border: ${({ theme }): string => `1px solid ${theme.borderPrimary}`};
  border-radius: 4px;
  min-height: 33rem;

  ${TabList} {
    justify-content: flex-start;
    border-bottom: ${({ theme }): string => `1px solid ${theme.borderPrimary}`};
    box-sizing: border-box;
  }

  ${TabList} > button {
    flex: 0 0 auto;
    min-width: 96px;
    padding: 12px 0.8rem;
    line-height: 2;
    height: auto;
    font-family: var(--font-default);
  }

  > div > div:last-of-type {
    height: 100%;
    position: relative;
  }

  .tab-content {
    padding: 20px 16px;
  }

  .tab-extra-content {
    width: 100%;
  }
  ${media.mediumDown} {
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
