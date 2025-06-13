import { PropsWithChildren } from 'react'

import { createPortal } from 'react-dom'

// mounts children in the body
// which isolates them from the overall App styles
// imported for inherited styles
// usual use cases -- tooltips, popups, modals
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Portal = ({ children }: PropsWithChildren) => {
  return createPortal(children, document.body)
}

export default Portal
