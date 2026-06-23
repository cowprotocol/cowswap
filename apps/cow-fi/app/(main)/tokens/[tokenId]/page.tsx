import { redirect } from 'next/navigation'

import { getTokenDetails, getTokensIds } from '../../../../services/tokens'

import type { TokenDetails } from '../../../../types'
import type { Metadata } from 'next'

import { TokenPageComponent } from '@/components/TokenPageComponent'
import { CONFIG } from '@/const/meta'
import { getPageMetadata } from '@/util/getPageMetadata'

type Props = {
  params: Promise<{ tokenId: string }>
}

function getTokenMetaData(token: TokenDetails) {
  const { name, symbol, change24h, priceUsd } = token
  const priceSegment = typeof priceUsd === 'number' ? `$${priceUsd}` : 'Price unavailable'
  const change24hFormatted = typeof change24h === 'number' ? change24h.toFixed(2) : '0.00'
  const isIncrease = typeof change24h === 'number' ? change24h >= 0 : true
  const priceChangeEmoji = typeof change24h === 'number' ? (isIncrease ? '🟢' : '🔴') : '⚪'
  const changeDirection = typeof change24h === 'number' ? (isIncrease ? '▲' : '▼') : '•'
  const title = `${priceChangeEmoji} ${name} (${symbol}) ${priceSegment} (${change24hFormatted}% ${changeDirection}) - ${CONFIG.metatitle_tokenDetail} - ${CONFIG.title.default}`
  const description = `Track the latest ${name} (${symbol}) price, market cap, trading volume, and more with CoW DAO's live ${name} price chart.`

  return { title, description }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const tokenId = (await params).tokenId

  if (!tokenId) return {}

  const token = await getTokenDetails(tokenId)

  if (!token) return {}

  return getPageMetadata(getTokenMetaData(token))
}

export async function generateStaticParams() {
  const tokenIds = await getTokensIds()

  return tokenIds.map((tokenId) => ({ tokenId }))
}

export default async function Page({ params }: Props) {
  const tokenId = (await params).tokenId

  if (!tokenId) return null

  const token = await getTokenDetails(tokenId)

  if (!token) return redirect('/tokens')

  return <TokenPageComponent token={token} />
}
