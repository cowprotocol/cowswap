import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import { Layout } from '@/components/Layout'
import { NotFoundPageComponent } from '@/components/NotFoundPageComponent'
import { getPageMetadata } from '@/util/getPageMetadata'

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    title: '404 - Page Not Found',
    description:
      'This page could not be found. Please go back to the homepage or use the navigation menu to find what you are looking for.',
  })
}

export default async function Page(): Promise<ReactNode> {
  return (
    <Layout bgColor="#F0DEDE" showCowSaucer contentMinHeight="auto">
      <NotFoundPageComponent />
    </Layout>
  )
}
