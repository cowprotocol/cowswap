'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'

import { getPositionValue } from '../lib/positionValue'

import type { AccountBalances } from '@/widgets/account'

import { assetQueryAtomFamily, DividendNotes, type RwaAsset, type RwaToken } from '@/entities/asset'
import { getChainLabel } from '@/shared/lib/chain'
import { formatTokenAmount, formatUsd } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

interface PositionsTabProps {
  asset: RwaAsset
  balances: AccountBalances<RwaToken>
}

export function PositionsTab({ asset, balances: { positions, error } }: PositionsTabProps): ReactNode {
  const market = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market

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
                  <td className={styles.numeric}>{formatUsd(getPositionValue(token, balance, market))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <StatusMessage>You don&apos;t hold any {asset.ticker} tokens</StatusMessage>
      )}
      <DividendNotes className={styles.dividendNotes} tokens={positions.map(({ token }) => token)} />
    </>
  )
}
