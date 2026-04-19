import { ReactNode } from 'react'

import { TENDERLY_AVAILABLE } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { faGroupArrowsRotate, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router'

import { TAB_QUERY_PARAM_KEY } from '../../../../explorer/const'
import { getTenderlyTxUrl } from '../../../../utils/tenderly'
import { DetailRow } from '../../../common/DetailRow'
import { RowWithCopyButton } from '../../../common/RowWithCopyButton'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { LinkButton, Wrapper, ExternalLinkButton } from '../styled'

interface TxHashItemProps {
  txHash: string | undefined
  chainId: SupportedChainId
  onCopy(label: string): void
  isLoading: boolean
}

export function TxHashItem({ chainId, txHash, onCopy, isLoading }: TxHashItemProps): ReactNode {
  if (!txHash) return null

  const shouldDisplayBatchGraph = TENDERLY_AVAILABLE[chainId]
  const tenderlyUrl = getTenderlyTxUrl(txHash)

  return (
    <DetailRow label="Transaction hash" tooltipText={DetailsTableTooltips.hash} isLoading={isLoading}>
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

        {shouldDisplayBatchGraph && (
          <>
            <LinkButton to={`/tx/${txHash}/?${TAB_QUERY_PARAM_KEY}=graph`}>
              <FontAwesomeIcon icon={faProjectDiagram} />
              Graph
            </LinkButton>

            <ExternalLinkButton href={tenderlyUrl} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faGroupArrowsRotate} />
              Tenderly↗
            </ExternalLinkButton>
          </>
        )}
      </Wrapper>
    </DetailRow>
  )
}
