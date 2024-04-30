import Head from 'next/head'
import { GetStaticProps } from 'next'
import { CONFIG } from '@/const/meta'
import Layout from '@/components/Layout'
import { getJobs } from 'services/greenhouse'
import { Careers } from '@/components/Careers'

export default function Jobs({ jobsData }) {
  return (
    <>
      <Head>
        <title>Careers - {CONFIG.title}</title>
      </Head>
      <Layout>
        <Careers jobsData={jobsData} />
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const jobsData = await getJobs()
  const siteConfigData = CONFIG

  return {
    props: { jobsData, siteConfigData },

    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 3600 seconds (1 hour)
    revalidate: 3600, // In seconds
  }
}