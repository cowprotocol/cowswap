import React, { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { faGroupArrowsRotate, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router'

import { TAB_QUERY_PARAM_KEY } from '../../../../explorer/const'
import { DetailRow } from '../../../common/DetailRow'
import { RowWithCopyButton } from '../../../common/RowWithCopyButton'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { LinkButton, Wrapper } from '../styled'

interface TxHashItemProps {
  txHash: string | undefined
  chainId: SupportedChainId
  onCopy(label: string): void
  isLoading: boolean
}

export function TxHashItem({ chainId, txHash, onCopy, isLoading }: TxHashItemProps): ReactNode {
  if (!txHash) return null

  return (
    <DetailRow label="Transaction hash" tooltipText={DetailsTableTooltips.hash} isLoading={isLoading}>
      {txHash ? (
        <Wrapper>
          <RowWithCopyButton
            textToCopy={txHash}
            onCopy={() => onCopy('settlementTx')}
            contentsToDisplay={
              <Link to={getExplorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)} target="_blank">
                {txHash}↗
              </Link>
            }
          />
          <Wrapper>
            <LinkButton to={`/tx/${txHash}`}>
              <FontAwesomeIcon icon={faGroupArrowsRotate} />
              Batch
            </LinkButton>
            <LinkButton to={`/tx/${txHash}/?${TAB_QUERY_PARAM_KEY}=graph`}>
              <FontAwesomeIcon icon={faProjectDiagram} />
              Graph
            </LinkButton>
          </Wrapper>
        </Wrapper>
      ) : null}
    </DetailRow>
  )
}
