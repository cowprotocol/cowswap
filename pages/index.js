import Head from 'next/head'
import Alert from '../components/Alerts'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.scss'

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hi there, I'm reviewing how easy it is to develop for NEXT</p>
      </section>
      <section>
        <Alert type="success">
          hi
        </Alert>
      </section>
    </Layout>
  )
}