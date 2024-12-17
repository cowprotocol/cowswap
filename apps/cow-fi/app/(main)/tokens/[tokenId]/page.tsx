'use server'

import React from 'react'

import { getTokenDetails as getTokenDetails, getTokensIds } from '../../../../services/tokens'
import { CONFIG } from '@/const/meta'

import { TokenPageComponent } from '@/components/TokenPageComponent'
import type { Metadata } from 'next'
import type { TokenDetails } from '../../../../types'
import { getPageMetadata } from '@/util/getPageMetadata'

type Props = {
  params: Promise<{ tokenId: string }>
}

function getTokenMetaData(token: TokenDetails) {
  const { name, symbol, change24h, priceUsd } = token
  const change24 = parseFloat(change24h as string)
  const change24hFormatted = change24.toFixed(2)
  const isIncrease = parseFloat(change24h as string) >= 0
  const priceChangeEmoji = isIncrease ? '🟢' : '🔴'
  const changeDirection = isIncrease ? '▲' : '▼'
  const title = `${priceChangeEmoji} ${name} (${symbol}) $${priceUsd} (${change24hFormatted}% ${changeDirection}) - ${CONFIG.metatitle_tokenDetail} - ${CONFIG.title.default}`
  const description = `Track the latest ${name} (${symbol}) price, market cap, trading volume, and more with CoW DAO's live ${name} price chart.`

  return { title, description }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const tokenId = (await params).tokenId

  if (!tokenId) return {}

  const token = await getTokenDetails(tokenId)

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

  return <TokenPageComponent token={token} />
}
