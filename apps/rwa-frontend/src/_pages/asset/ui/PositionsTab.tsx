'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'

import type { AssetBalances } from '../model/useAssetBalances'

import { assetQueryAtomFamily, type RwaAsset } from '@/entities/asset'
import { getChainLabel } from '@/shared/lib/chain'
import { formatTokenAmount, formatUsd, toTokenUnits } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

interface PositionsTabProps {
  asset: RwaAsset
  balances: AssetBalances
}

export function PositionsTab({ asset, balances: { positions, error } }: PositionsTabProps): ReactNode {
  const price = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market?.price

  if (!positions) {
    return <StatusMessage>{error ? `Failed to load balances: ${error.message}` : 'Loading balances…'}</StatusMessage>
  }

  return (
    <>
      {error && <p className={styles.warning}>Some balances are unavailable: {error.message}</p>}
      {positions.length ? (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Token</th>
                <th>Network</th>
                <th className={styles.numeric}>Balance</th>
                <th className={styles.numeric}>Value</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(({ token, balance }) => (
                <tr key={`${token.chainId}:${token.address}`}>
                  <td>
                    {token.symbol}
                    <span className={styles.secondary}>{token.name}</span>
                  </td>
                  <td>{getChainLabel(token.chainId)}</td>
                  <td className={styles.numeric}>{formatTokenAmount(balance, token.decimals)}</td>
                  <td className={styles.numeric}>
                    {formatUsd(typeof price === 'number' ? toTokenUnits(balance, token.decimals) * price : null)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <StatusMessage>You don&apos;t hold any {asset.ticker} tokens</StatusMessage>
      )}
    </>
  )
}
