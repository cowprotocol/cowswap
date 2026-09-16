import type { ReactNode } from 'react'

import { Metadata } from 'next'

import { ContentDisclaimer } from '@/components/ContentDisclaimer'
import { CONFIG } from '@/const/meta'
import { getPageMetadata } from '@/util/getPageMetadata'

const title = 'Knowledge Base - CoW DAO'

export const metadata: Metadata = {
  ...getPageMetadata({
    title,
    description: CONFIG.description,
  }),
  title: {
    default: title,
    template: '%s - CoW DAO',
  },
}

export default function LayoutPage({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      {children}
      <ContentDisclaimer />
    </>
  )
}
