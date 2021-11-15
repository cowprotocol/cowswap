import Head from 'next/head'

import Layout from '../../components/layout'
import Date from '../../components/Date'
import utilStyles from '../../styles/utils.module.scss'
import { getAllPostIds, getPostData } from '../../lib/posts'


export default function Post({ postData }) {
  const { id, title, date, contentHtml } = postData
  return (
    <Layout>
      <Head>
        <title>CoW - { title }</title>
      </Head>
      <h1 className={utilStyles.headingXl}>{postData.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={postData.date} />
      </div>
      {/* <pre>{ JSON.stringify(postData, null, 2) }</pre> */}
      <div data-post-id={id} dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Layout>
  )
}

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    }
  }
}