'use client'

import { WordTags } from '@cowprotocol/ui'
import { Layout } from '@/components/Layout'

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return <Layout bgColor={WordTags.orange.background}>{children}</Layout>
}
