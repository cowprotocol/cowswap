import React from 'react'

import Loader from 'components/Loader'
import { IconWrapper } from '../TransactionMod'

import SVG from 'react-inlinesvg'
import TxArrowsImage from 'assets/cow-swap/transaction-arrows.svg'
import TxCheckImage from 'assets/cow-swap/transaction-confirmed.svg'

import { IconType } from './styled'
import { ActivityDerivedState, determinePillColour } from '.'

export function StateIcon(props: { activityDerivedState: ActivityDerivedState }) {
  const { status, type, isPending, isCancelling, isConfirmed, isExpired, isCancelled, isPresignaturePending } =
    props.activityDerivedState

  return (
    <IconType color={determinePillColour(status, type)}>
      <IconWrapper pending={isPending || isCancelling} success={isConfirmed || isCancelled}>
        {isPending || isPresignaturePending || isCancelling ? (
          <Loader />
        ) : isConfirmed ? (
          <SVG src={TxCheckImage} description="Order Filled" />
        ) : isExpired ? (
          <SVG src={TxArrowsImage} description="Order Expired" />
        ) : isCancelled ? (
          <SVG src={TxArrowsImage} description="Order Cancelled" />
        ) : (
          <SVG src={TxArrowsImage} description="Order Open" />
        )}
      </IconWrapper>
    </IconType>
  )
}
