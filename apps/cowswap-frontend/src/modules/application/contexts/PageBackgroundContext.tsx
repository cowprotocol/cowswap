import { createContext, ReactNode, useContext, useLayoutEffect, Dispatch, SetStateAction } from 'react'

export interface PageBackgroundContextValue {
  variant: PageBackgroundVariant
  setVariant: Dispatch<SetStateAction<PageBackgroundVariant>>
  scene: ReactNode | null
  setScene: Dispatch<SetStateAction<ReactNode | null>>
  layout: PageLayoutVariant
  setLayout: Dispatch<SetStateAction<PageLayoutVariant>>
}

export type PageBackgroundVariant = 'default' | 'nocows'

/** `fullBleed` drops the shell padding, the cow background and the footer so a page owns the viewport. */
export type PageLayoutVariant = 'default' | 'fullBleed'

export const PageBackgroundContext = createContext<PageBackgroundContextValue | undefined>(undefined)
PageBackgroundContext.displayName = 'PageBackgroundContext'

export function useFullBleedPage(): void {
  const { setLayout } = usePageBackground()

  // Layout effect, so the padded shell never paints for a frame before the page takes over.
  useLayoutEffect(() => {
    setLayout('fullBleed')

    return () => setLayout('default')
  }, [setLayout])
}

export function usePageBackground(): PageBackgroundContextValue {
  const context = useContext(PageBackgroundContext)

  if (!context) {
    throw new Error('usePageBackground must be used within a PageBackgroundContext provider')
  }

  return context
}
