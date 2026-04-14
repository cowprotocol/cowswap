import { Layout } from '@/components/Layout'

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return <Layout bgColor="#F0DEDE">{children}</Layout>
}
