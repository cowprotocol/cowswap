import Link from 'next/link'
import Content from 'components/Layout/Content'

// pages/404.js
export default function Custom404() {
  return (
    <Content>
      <h1>404 - Page Not Found</h1>
      <section><p>This page could not be found. Please go back to the <Link href="/">home page.</Link></p></section>
    </Content>
  )
}