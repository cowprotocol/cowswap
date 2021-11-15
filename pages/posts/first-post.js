import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import Layout from '../../components/Layout'

const Profile = () => {
  return (<Image
    src="/images/profile.jpg" // Route of the image file
    height={120} // Desired size with correct aspect ratio
    width={120} // Desired size with correct aspect ratio
    alt="Your Name"
  />)
}

export default function FirstPost() {
  return (
    <Layout>
      <Head>
        <title>First Post | Cow</title>
      </Head>
      <h1>First Post</h1>
      <h2><Link href="/"><a>Back to home</a></Link></h2>
      <Profile />
    </Layout>
  )
}