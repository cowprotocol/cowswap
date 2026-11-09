import { isRecord } from '@cowprotocol/common-utils/json-utils'
import { getSafeAbsoluteUrl } from '@cowprotocol/common-utils/safeLink'

export interface AffiliateContent {
  label: string
  hero: MarketingText & { button: MarketingButton }
  introduction: MarketingText
  steps: { title: string; items: MarketingText[] }
  benefits: MarketingText
  faq: MarketingText & { items: MarketingText[] }
  footer: MarketingText & { button: MarketingButton; docsButton: MarketingButton }
}

export interface CareersContent {
  intro: MarketingText
  referral: MarketingText & { button: MarketingButton }
  notice: MarketingText & {
    never: MarketingText
    actions: MarketingText
    channels: MarketingText
    closing: MarketingText
  }
}

export interface MarketingButton {
  text: string
  url: string
  newTab: boolean
}

export interface MarketingText {
  title: string
  description: string
}

export function parseAffiliateContent(page: unknown): AffiliateContent {
  const { attributes, sections } = readPage(page, [
    'sections.bottom-actions',
    'sections.heading',
    'sections.features',
    'sections.heading',
    'sections.features',
    'sections.bottom-actions',
  ])
  const heroButtons = readButtons(sections[0], 1)
  const footerButtons = readButtons(sections[5], 2)

  return {
    label: readString(attributes.heading),
    hero: { ...readText(sections[0]), button: heroButtons[0] },
    introduction: readHeading(sections[1]),
    steps: { title: readString(sections[2].heading), items: readFeatures(sections[2], 'feature', 3) },
    benefits: readHeading(sections[3]),
    faq: { ...readHeading(sections[4]), items: readFeatures(sections[4], 'feature') },
    footer: { ...readText(sections[5]), button: footerButtons[0], docsButton: footerButtons[1] },
  }
}

export function parseCareersContent(page: unknown): CareersContent {
  const { attributes, sections } = readPage(page, ['sections.bottom-actions', 'sections.heading', 'sections.features'])
  const [never, actions, channels, closing] = readFeatures(sections[2], 'feature', 4)
  const buttons = readButtons(sections[0], 1)

  return {
    intro: readHeading(attributes),
    referral: { ...readText(sections[0]), button: buttons[0] },
    notice: { ...readHeading(sections[1]), never, actions, channels, closing },
  }
}

function readButtons(section: Record<string, unknown>, count: number): MarketingButton[] {
  const buttons = section.buttons
  if (!Array.isArray(buttons) || buttons.length !== count) throw new Error('Invalid CMS marketing button count')

  return buttons.map((button: unknown) => {
    if (!isRecord(button)) throw new Error('Missing CMS marketing button')
    const url = readString(button.url)
    const isLocalPath = /^\/(?!\/)/.test(url) && !/[\\\s]/.test(url)
    const isHttpsUrl = /^https:\/\//i.test(url) && getSafeAbsoluteUrl(url) !== null
    if (!isLocalPath && !isHttpsUrl) {
      throw new Error('CMS marketing buttons require a local path or HTTPS URL')
    }
    return { text: readString(button.text), url, newTab: button.newTab === true }
  })
}

function readFeatures(section: Record<string, unknown>, field: string, count?: number): MarketingText[] {
  const features = section[field]
  if (!Array.isArray(features) || features.length === 0 || (count !== undefined && features.length !== count)) {
    throw new Error(`Invalid CMS marketing ${field} count`)
  }
  return features.map(readText)
}

function readHeading(value: Record<string, unknown>): MarketingText {
  return { title: readString(value.heading), description: readString(value.description) }
}

function readPage(
  page: unknown,
  sectionTypes: string[],
): { attributes: Record<string, unknown>; sections: Record<string, unknown>[] } {
  if (!isRecord(page) || !isRecord(page.attributes) || !Array.isArray(page.attributes.contentSections)) {
    throw new Error('Missing marketing page content in CMS')
  }

  const sections = page.attributes.contentSections
  if (sections.length !== sectionTypes.length) {
    throw new Error('Unexpected marketing page section count in CMS')
  }

  return {
    attributes: page.attributes,
    sections: sections.map((section: unknown, index: number) => {
      if (!isRecord(section) || section.__component !== sectionTypes[index]) {
        throw new Error(`Unexpected CMS marketing section at position ${index + 1}`)
      }
      return section
    }),
  }
}

function readString(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Missing marketing text in CMS')
  }
  return value
}

function readText(value: unknown): MarketingText {
  if (!isRecord(value)) throw new Error('Missing CMS marketing section')
  return { title: readString(value.title), description: readString(value.description) }
}
