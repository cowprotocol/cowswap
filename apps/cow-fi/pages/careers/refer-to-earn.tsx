import Head from 'next/head'
import { GetStaticProps } from 'next'
import { CONFIG } from '@/const/meta'
import Layout from '@/components/Layout'
import { ReferToEarn } from '@/components/Careers/ReferToEarn'

export default function ReferToEarnPage() {
  return (
    <>
      <Head>
        <title>Career Referral Program - {CONFIG.title}</title>
      </Head>
      <Layout>
        <ReferToEarn />
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const siteConfigData = CONFIG

  return {
    props: { siteConfigData },

    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 3600 seconds (1 hour)
    revalidate: 3600, // In seconds
  }
}