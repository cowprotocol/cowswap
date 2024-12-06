import { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Widget - Terms and Conditions' },
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
