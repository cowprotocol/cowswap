import { Color } from '@cowprotocol/ui'

import { StylesheetCSS } from 'cytoscape'
import styled, { css } from 'styled-components/macro'

// TODO: update icon
import CowProtocolIcon from '../../../assets/img/CoW-protocol.svg'
import DexIcon from '../../../assets/img/Dex.svg'
import TokenIcon from '../../../assets/img/eth-network.svg'
// TODO: update icon
import SpecialIcon from '../../../assets/img/Trader-variant.svg'
// TODO: update icon
import TraderIcon from '../../../assets/img/Trader.svg'
import { ArrowIconCSS } from '../../../components/icons/cssIcons'
import { MEDIA } from '../../../const'
import { Dropdown } from '../common/Dropdown'

export const FloatingWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1.6rem;
  z-index: 1;
  display: inline-flex;
  flex-direction: row-reverse;
  gap: 0.6rem;

  @media ${MEDIA.mediumDown} {
    flex-direction: column;
    top: 2.4rem;
    right: 0.8rem;
    gap: 0.6rem;
  }
`

const FloatingButton = css`
  cursor: pointer;
  color: ${(): string => Color.neutral100};
  height: 3rem;
  border: 1px solid ${Color.explorer_border};
  border-radius: 0.5rem;
  background: ${Color.explorer_bg2};

  &:hover {
    transition: all 0.2s ease-in-out;
    color: ${Color.explorer_textActive};
  }

  @media ${MEDIA.mediumDown} {
    min-width: 3rem;
    span {
      display: none;
    }
  }
`
export const ResetButton = styled.button`
  ${FloatingButton} {
    min-width: 6.586rem;
    transition: all 0.2s ease-in-out;
  }
`
export const LayoutButton = styled.span`
  ${FloatingButton} {
    display: flex;
    color: ${Color.explorer_textPrimary};
    font-size: ${({ theme }): string => theme.fontSizeDefault};
    font-weight: normal;
    white-space: nowrap;
    align-items: center;
    padding: 0 0.6rem 0 0.6rem;
  }
`

export const DropdownWrapper = styled(Dropdown)`
  &.dropdown-container {
    ${ArrowIconCSS}
    div:first-child {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
  }
`

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function STYLESHEET(): StylesheetCSS[] {
  return [
    {
      selector: 'node[label]',
      css: {
        label: 'data(label)',
        color: Color.neutral100,
        height: 50,
        width: 50,
        'background-color': Color.explorer_bg2,
      },
    },
    {
      selector: 'node',
      css: {
        'border-style': 'solid',
        'border-width': 3,
        'border-opacity': 0,
      },
    },
    {
      selector: 'node.hover',
      css: {
        'border-color': Color.explorer_orange1,
        'border-style': 'solid',
        'border-width': 3,
        'border-opacity': 0.75,
      },
    },
    {
      selector: 'edge[label]',
      css: {
        label: 'data(label)',
        width: 2,
        'target-arrow-shape': 'triangle',
        'target-arrow-color': Color.explorer_grey,
        'curve-style': 'unbundled-bezier',
        color: Color.neutral0,
        'line-color': Color.explorer_grey,
        'line-opacity': 0.8,
        'text-background-color': Color.explorer_labelTextOpen,
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'font-size': '16px',
        'min-zoomed-font-size': 8,
        'text-rotation': 'autorotate',
      },
    },
    {
      selector: 'edge.many-bidirectional',
      css: {
        'curve-style': 'bezier',
        'font-size': '15px',
        'text-background-padding': '3px',
      },
    },
    {
      selector: 'edge.sell,edge.amm',
      css: {
        'line-color': Color.explorer_textError,
        'target-arrow-color': Color.explorer_textError,
      },
    },
    {
      selector: 'edge.buy,edge.user',
      css: {
        'line-color': Color.explorer_green1,
        'target-arrow-color': Color.explorer_green1,
      },
    },
    {
      selector: 'edge.amm,edge.user',
      css: {
        'curve-style': 'bezier',
      },
    },
    {
      selector: 'edge.hover',
      css: {
        width: 3,
        'line-color': Color.explorer_orange1,
        'target-arrow-color': Color.explorer_orange1,
        'text-background-color': Color.explorer_orange1,
        color: Color.neutral100,
      },
    },
    {
      selector: 'node[type="trader"]',
      css: {
        'background-image': `url(${TraderIcon})`,
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="special"]',
      css: {
        'background-image': `url(${SpecialIcon})`,
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="dex"]',
      css: {
        'background-image': `url(${DexIcon})`,
        'text-max-width': '5rem',
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="token"]',
      css: {
        'background-image': `url(${TokenIcon})`,
        'text-max-width': '5rem',
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="hyper"]',
      css: {
        'background-color': Color.explorer_textError,
        width: '10',
        height: '10',
        'text-max-width': '5rem',
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="cowProtocol"]',
      css: {
        'background-image': `url(${CowProtocolIcon})`,
        height: '90',
        width: '90',
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="networkNode"]',
      css: {
        'border-style': 'dashed',
        'border-opacity': 0.8,
        'border-width': 1,
        opacity: 0.8,
      },
    },
  ]
}
