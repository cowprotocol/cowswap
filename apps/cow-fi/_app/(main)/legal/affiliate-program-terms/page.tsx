import { createCmsPage } from '@/util/createCmsPage'

const { default: Page, generateMetadata } = createCmsPage('affiliate-program-terms')

export { Page as default, generateMetadata }

// ISR caching - revalidate every 12 hours
export const revalidate = 43200
