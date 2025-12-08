import { useTheme } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/react/macro'
import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { CowLoadingIcon } from 'common/pure/CowLoadingIcon'

export const LoadingWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  position: fixed;
  background: ${({ theme }) => transparentize(theme.bg2, 0.8)};
  z-index: 99;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(3px);

  > span {
    display: block;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    margin: 20px auto 0;
    color: inherit;
  }
`

export const Loading: React.FC = () => {
  const { darkMode } = useTheme()

  return (
    <LoadingWrapper>
      <CowLoadingIcon size={120} isDarkMode={darkMode} />
      <span><Trans>Loading...</Trans></span>
    </LoadingWrapper>
  )
}
