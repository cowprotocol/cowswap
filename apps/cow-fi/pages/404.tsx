import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import { CONFIG } from '@/const/meta'
import { Title, Section } from '@/components/Layout/index.styles'
import Layout from '@/components/Layout'

// pages/404.js
export default function Custom404({ siteConfigData }) {
  const { title } = siteConfigData

  return (
    <>
      <Head>
        <title>Page Not Found (404) - {title}</title>
      </Head>
      <Layout>
        <Section>
          <Title>404 - Page Not Found</Title>
          <p>
            This page could not be found. Please go back to the <Link href="/">home page.</Link>
          </p>
        </Section>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const siteConfigData = CONFIG

  return {
    props: { siteConfigData },
  }
}
