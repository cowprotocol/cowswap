import { Media, RowFixed, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

export const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  max-width: 100%;
  height: 100%;

  ${Media.upToMedium()} {
    margin: 0 0 0 auto;
    height: 56px;
    width: 100%;
    position: sticky;
    bottom: 0;
    left: 0;
    z-index: 10;
    background: var(${UI.COLOR_PAPER});
    padding: 5px 10px;
    flex-flow: row-reverse;
    justify-content: space-between;
  }
`

export const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  height: 100%;
`

export const LogoImage = styled.div<{ isMobileMenuOpen?: boolean }>`
  width: 131px;
  height: 41px;
  background: none;
  margin: 0 32px 0 0;
  position: relative;

  ${Media.upToSmall()} {
    height: 30px;
    width: auto;
  }

  ${Media.upToLarge()} {
    ${({ isMobileMenuOpen }) =>
    isMobileMenuOpen &&
    css`
        height: 34px;
        width: auto;
      `}
  }

  > svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
  }
`

export const UniIcon = styled.div`
  display: flex;
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-5deg);
  }
`

export const HeaderRow = styled(RowFixed)`
  ${Media.upToMedium()} {
    width: 100%;
  }
`
