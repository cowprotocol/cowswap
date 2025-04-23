// This is a Server Component by default in the app directory
import { Layout } from '@/components/Layout'
import { NotFoundPageComponent } from '@/components/NotFoundPageComponent'
import { getPageMetadata } from '@/util/getPageMetadata'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    title: '404 - Page Not Found',
    description:
      'This page could not be found. Please go back to the homepage or use the navigation menu to find what you are looking for.',
  })
}

export default async function Page() {
  return (
    <Layout bgColor="#F0DEDE">
      <NotFoundPageComponent />
    </Layout>
  )
}
