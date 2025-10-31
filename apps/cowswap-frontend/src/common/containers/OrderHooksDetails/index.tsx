import { ReactElement, useEffect, useMemo, useState } from 'react'

import { cowAppDataLatestScheme } from '@cowprotocol/cow-sdk'
import { CowHookDetails, HookToDappMatch, matchHooksToDappsRegistry } from '@cowprotocol/hook-dapp-lib'
import { InfoTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useHooksStateWithSimulatedGas } from 'entities/orderHooks/useHooksStateWithSimulatedGas'
import { ChevronDown, ChevronUp } from 'react-feather'

import { AppDataInfo, decodeAppData } from 'modules/appData'
import { useCustomHookDapps } from 'modules/hooksStore/hooks/useCustomHookDapps'
import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { HookItem } from './HookItem'
import * as styledEl from './styled'
import { CircleCount } from './styled'

interface OrderHooksDetailsProps {
  appData: string | AppDataInfo
  children: (content: ReactElement) => ReactElement
  margin?: string
  isTradeConfirmation?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function OrderHooksDetails({ appData, children, margin, isTradeConfirmation }: OrderHooksDetailsProps) {
  const [isOpen, setOpen] = useState(false)
  const appDataDoc = useMemo(() => {
    return typeof appData === 'string' ? decodeAppData(appData) : appData.doc
  }, [appData])
  const preCustomHookDapps = useCustomHookDapps(true)
  const postCustomHookDapps = useCustomHookDapps(false)

  const hooks = useHooksStateWithSimulatedGas()

  const { mutate, isValidating, data } = useTenderlyBundleSimulation()

  useEffect(() => {
    if (isTradeConfirmation) mutate()
  }, [isTradeConfirmation, mutate])

  // Not all versions of appData have metadata
  if (!appDataDoc?.metadata) return null

  const metadata = appDataDoc.metadata as cowAppDataLatestScheme.Metadata

  const hasSomeFailedSimulation = isTradeConfirmation && Object.values(data || {}).some((hook) => !hook.status)

  const preHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.pre || [], preCustomHookDapps)
  const postHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.post || [], postCustomHookDapps)

  if (!preHooksToDapp.length && !postHooksToDapp.length) return null

  return children(
    <styledEl.Wrapper isOpen={isOpen} margin={margin}>
      <styledEl.Summary>
        <styledEl.Label>
          <Trans>Hooks</Trans>
          <InfoTooltip content={<Trans>Hooks are interactions before/after order execution.</Trans>} />
          {hasSomeFailedSimulation && (
            <styledEl.ErrorLabel>
              <Trans>Simulation failed</Trans>
            </styledEl.ErrorLabel>
          )}
          {isValidating && <styledEl.Spinner />}
        </styledEl.Label>
        <styledEl.Content onClick={() => setOpen(!isOpen)}>
          {preHooksToDapp.length > 0 && (
            <styledEl.HookTag addSeparator={postHooksToDapp.length > 0}>
              <Trans>PRE</Trans> <b>{preHooksToDapp.length}</b>
            </styledEl.HookTag>
          )}
          {postHooksToDapp.length > 0 && (
            <styledEl.HookTag isPost>
              <Trans>POST</Trans> <b>{postHooksToDapp.length}</b>
            </styledEl.HookTag>
          )}
        </styledEl.Content>
        <styledEl.ToggleButton isOpen={isOpen} onClick={() => setOpen(!isOpen)}>
          <styledEl.ToggleIcon isOpen={isOpen}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </styledEl.ToggleIcon>
        </styledEl.ToggleButton>
      </styledEl.Summary>
      {isOpen && (
        <styledEl.Details>
          <HooksInfo data={preHooksToDapp} hooks={isTradeConfirmation ? hooks.preHooks : []} title={t`Pre Hooks`} />
          <HooksInfo data={postHooksToDapp} hooks={isTradeConfirmation ? hooks.postHooks : []} title={t`Post Hooks`} />
        </styledEl.Details>
      )}
    </styledEl.Wrapper>,
  )
}

interface HooksInfoProps {
  data: HookToDappMatch[]
  title: string
  hooks: CowHookDetails[]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function HooksInfo({ data, title, hooks }: HooksInfoProps) {
  return (
    <>
      {data.length ? (
        <styledEl.InfoWrapper>
          <h3>
            {title} <CircleCount>{data.length}</CircleCount>
          </h3>
          <styledEl.HooksList>
            {data.map((item, index) => {
              const key = item.hook.callData + item.hook.target + item.hook.gasLimit
              const details = hooks.find(({ hook }) => key === hook.callData + hook.target + hook.gasLimit)
              return <HookItem key={key} item={item} index={index} details={details} />
            })}
          </styledEl.HooksList>
        </styledEl.InfoWrapper>
      ) : null}
    </>
  )
}
