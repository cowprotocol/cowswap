import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'

import Layout from '../../components/Layout'
import Date from '../../components/Date'
import utilStyles from '../../styles/utils.module.scss'
import { getAllPostIds, getPostData } from '../../lib/posts'


export default function Post({ postData }) {
  const { id, title, date, contentHtml } = postData

  return (
    <Layout>
      <Head>
        <title>CoW - {title}</title>
        {/* 
        // alternatives to specify alternative versions: (sitemap / headers / link rel)
        <link rel="alternate" href="es" href="https://es.myweb.com/mycontent" /> 
        */}
      </Head>
      <h1 className={utilStyles.headingXl}>{postData.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={date} />
      </div>
      {/* <pre>{ JSON.stringify(postData, null, 2) }</pre> */}
      <div data-post-id={id} dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async (props) => {
  const { params } = props
  props.locale

  const postData = await getPostData(params.id as string, props.locale)
  return {
    props: {
      postData
    }
  }
}