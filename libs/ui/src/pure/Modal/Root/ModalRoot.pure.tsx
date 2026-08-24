import { ReactNode, useRef } from 'react'

import clsx from 'clsx'
import styled from 'styled-components/macro'

import { useIsScrolled } from './useIsScrolled'

import { MODAL_DEBUG, MODAL_ROOT_SCROLLED_CLASS } from '../Modal.constants'

const Root = styled.div`
  width: 100%;
  padding: 0;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  background: ${MODAL_DEBUG ? 'magenta' : 'transparent'};

  ${({ theme }) => theme.colorScrollbar};
`

export function ModalRoot({ children, className }: { children: ReactNode; className?: string }): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null)
  const isScrolled = useIsScrolled(rootRef)

  return (
    <Root ref={rootRef} data-modal-root="" className={clsx(className, isScrolled && MODAL_ROOT_SCROLLED_CLASS)}>
      {children}
    </Root>
  )
}
