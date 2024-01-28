import React from 'react'

import alertImage from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import checkImage from '@cowprotocol/assets/cow-swap/check.svg'
import { ExternalLink } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { ApproveComparison, ApproveFooter, ApproveWrapper, CompareItem, ItemList } from './styled'

export function MetamaskApproveBanner() {
  return (
    <ApproveWrapper>
      <ApproveComparison>
        <CompareItem>
          <h5>'Max'</h5>
          <ItemList listIconAlert>
            <li>
              <SVG src={alertImage} /> Approval on each order
            </li>
            <li>
              <SVG src={alertImage} /> Pay gas on every trade
            </li>
          </ItemList>
        </CompareItem>
        <CompareItem highlight recommended>
          <h5>'Use default'</h5>
          <ItemList>
            <li>
              <SVG src={checkImage} /> Only approve once
            </li>
            <li>
              <SVG src={checkImage} /> Save on future gas fees
            </li>
          </ItemList>
        </CompareItem>
      </ApproveComparison>

      <ApproveFooter>
        <h6>No matter your choice, enjoy these benefits:</h6>
        <ul>
          <li>
            <SVG src={checkImage} /> The contract only withdraws funds for signed open orders
          </li>
          <li>
            <SVG src={checkImage} /> Immutable contract with multiple&nbsp;
            <ExternalLink
              href="https://github.com/cowprotocol/contracts/tree/main/audits"
              target={'_blank'}
              rel={'noopener'}
            >
              audits
            </ExternalLink>
          </li>
          <li>
            <SVG src={checkImage} /> Over 2 years of successful trading with billions in volume
          </li>
          <li>
            <SVG src={checkImage} /> Adjust your spending cap anytime
          </li>
        </ul>
      </ApproveFooter>
    </ApproveWrapper>
  )
}
