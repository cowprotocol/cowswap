import { ReactNode } from 'react'

import EqualIcon from '@cowprotocol/assets/cow-swap/equal.svg'

import SVG from 'react-inlinesvg'

import { TextWrapper } from '../../pure/Row/styled'
import { EqualSign } from '../../pure/styled'

interface ReceiveAmountTitleProps {
  children: ReactNode
}

export function ReceiveAmountTitle({ children }: ReceiveAmountTitleProps) {
  return (
    <>
      <EqualSign>
        <SVG src={EqualIcon} />
      </EqualSign>{' '}
      <TextWrapper>
        <b>{children}</b>
      </TextWrapper>
    </>
  )
}
