import React, { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { faLock } from '@fortawesome/free-solid-svg-icons'
import { BaseIconTooltipOnClick } from 'components/Tooltip'

import * as styledEl from './EulerCollateralSwap.styled'

import { VaultAsset } from '../../../../../hooks/euler'
import { OwnerLink } from '../../components/OwnerLink.pure'
import { TokenLink } from '../../components/TokenLink.pure'
import { formatAmount, subAccountNumber } from '../../euler.utils'
import {
  ArrowSep,
  DirectionLabel,
  SubInfo,
  TokenAmount,
  TokenBlock,
  TokenSymbol,
  TradeCard,
} from '../EulerPosition.styles'

export interface EulerCollateralSwapParams {
  owner: string
  account: string
  deadline: bigint
  fromVault: string
  toVault: string
  fromAmount: bigint
  disableSourceCollateral: boolean
}

export interface EulerCollateralSwapViewProps {
  params: EulerCollateralSwapParams
  chainId: SupportedChainId | null
  fromAsset: VaultAsset | undefined
  toAsset: VaultAsset | undefined
  fromAssets: bigint | undefined
  toAssets: bigint | undefined
}

export function EulerCollateralSwapView({
  params,
  chainId,
  fromAsset,
  toAsset,
  fromAssets,
  toAssets,
}: EulerCollateralSwapViewProps): ReactElement {
  const fromSymbol = fromAsset?.symbol ?? '…'
  const toSymbol = toAsset?.symbol ?? '…'
  const sub = subAccountNumber(params.owner, params.account)

  return (
    <div>
      <TradeCard>
        <TokenBlock>
          <DirectionLabel $green>SWAP OUT</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.fromVault}`}>
            <TokenLink symbol={fromSymbol} tokenAddress={fromAsset?.address} chainId={chainId} />
            {params.disableSourceCollateral && (
              <BaseIconTooltipOnClick
                tooltip={`${fromSymbol} will be disabled as collateral after swap`}
                targetContent={
                  <styledEl.DisabledCollateralBadge>
                    <styledEl.DisabledCollateralIcon icon={faLock} />
                  </styledEl.DisabledCollateralBadge>
                }
              />
            )}
          </TokenSymbol>
          <TokenAmount>{formatAmount(fromAssets, fromAsset?.decimals)}</TokenAmount>
        </TokenBlock>
        <ArrowSep>→</ArrowSep>
        <TokenBlock>
          <DirectionLabel $green>SWAP IN</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.toVault}`}>
            <TokenLink symbol={toSymbol} tokenAddress={toAsset?.address} chainId={chainId} />
          </TokenSymbol>
          <TokenAmount>≥ {formatAmount(toAssets, toAsset?.decimals)}</TokenAmount>
        </TokenBlock>
      </TradeCard>
      <SubInfo>
        Subaccount #{sub} · Owner <OwnerLink address={params.owner} />
      </SubInfo>
    </div>
  )
}
