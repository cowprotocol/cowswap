import { createCmsPage } from '@/util/createCmsPage'

const { default: Page, generateMetadata } = createCmsPage('cowswap-privacy-policy')

export { Page as default, generateMetadata }

// ISR caching - revalidate every 12 hours
export const revalidate = 43200
