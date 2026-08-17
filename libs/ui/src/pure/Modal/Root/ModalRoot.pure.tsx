import { ReactNode, useRef } from 'react'

import clsx from 'clsx'
import styled from 'styled-components/macro'

import { useIsScrolled } from './useIsScrolled'

import { MODAL_ROOT_SCROLLED_CLASS } from '../Modal.constants'

const Root = styled.div`
  width: 100%;
  padding: 0;
  overflow-y: auto;
  height: inherit;
  // background: yellow;
  ${({ theme }) => theme.colorScrollbar};
`

export function ModalRoot({ children }: { children: ReactNode }): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null)
  const isScrolled = useIsScrolled(rootRef)

  return (
    <Root ref={rootRef} className={clsx(isScrolled && MODAL_ROOT_SCROLLED_CLASS)}>
      {children}
    </Root>
  )
}
