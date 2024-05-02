import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ArrowIconCSS } from 'components/icons/cssIcons'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components/macro'
import { media } from 'theme/styles/media'

export const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  ${media.xSmallDown} {
    padding-right: 2rem;
  }

  ${ArrowIconCSS}
`

export const OptionsContainer = styled.div<{ width: number }>`
  position: absolute;
  z-index: 1;
  margin: 0 auto;
  width: ${(props: { width: number }): string => `${184 + props.width}px`};
  left: 15px;
  top: 54px;
  background: ${({ theme }): string => theme.bg1};
  border: 1px solid rgba(141, 141, 169, 0.3);
  box-sizing: border-box;
  border-radius: 6px;
`

export const Option = styled(NavLink)<{ color: string }>`
  display: flex;
  flex: 1;
  font-weight: 800;
  font-size: 13px;
  line-height: 18px;
  align-items: center;
  letter-spacing: 0.02em;
  padding: 12px 16px;
  text-decoration: none;

  &:hover {
    backdrop-filter: contrast(0.9);
    text-decoration: none;

    .name {
      color: ${({ theme }): string => theme.white};
    }
  }

  .name {
    color: ${({ theme }): string => theme.grey};

    &.selected {
      color: ${({ theme }): string => theme.white};
    }
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 100%;
    margin-right: 9px;
    background: ${({ color }) => color};
  }
`

export const NetworkLabel = styled.span<{ color: string }>`
  border-radius: 0.6rem;
  display: flex;
  margin: 0 0.5rem;
  font-size: 1.1rem;
  text-align: center;
  padding: 0.7rem;
  text-transform: uppercase;
  font-weight: ${({ theme }): string => theme.fontBold};
  letter-spacing: 0.1rem;

  background: ${({ color }) => color};
  color: ${({ theme }): string => theme.textSecondary1};
`

export const StyledFAIcon = styled(FontAwesomeIcon)`
  color: ${({ theme }): string => theme.orange};
  position: absolute;
  right: 10px;
  font-size: 14px;
`
