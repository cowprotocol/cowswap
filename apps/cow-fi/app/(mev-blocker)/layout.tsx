'use client'

import { Color } from '@cowprotocol/ui'
import { Layout } from '@/components/Layout'

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return <Layout bgColor={Color.cowfi_orange_pale}>{children}</Layout>
}
