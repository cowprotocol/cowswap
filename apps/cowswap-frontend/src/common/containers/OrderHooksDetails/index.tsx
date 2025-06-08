import { ReactElement, useEffect, useMemo, useState } from 'react'

import { latest } from '@cowprotocol/app-data'
import { CowHookDetails, HookToDappMatch, matchHooksToDappsRegistry } from '@cowprotocol/hook-dapp-lib'
import { InfoTooltip } from '@cowprotocol/ui'

import { ChevronDown, ChevronUp } from 'react-feather'

import { AppDataInfo, decodeAppData } from 'modules/appData'
import { useCustomHookDapps, useHooksStateWithSimulatedGas } from 'modules/hooksStore'
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
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
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

  if (!appDataDoc) return null

  const metadata = appDataDoc.metadata as latest.Metadata

  const hasSomeFailedSimulation = isTradeConfirmation && Object.values(data || {}).some((hook) => !hook.status)

  const preHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.pre || [], preCustomHookDapps)
  const postHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.post || [], postCustomHookDapps)

  if (!preHooksToDapp.length && !postHooksToDapp.length) return null

  return children(
    <styledEl.Wrapper isOpen={isOpen} margin={margin}>
      <styledEl.Summary>
        <styledEl.Label>
          Hooks
          <InfoTooltip content="Hooks are interactions before/after order execution." />
          {hasSomeFailedSimulation && <styledEl.ErrorLabel>Simulation failed</styledEl.ErrorLabel>}
          {isValidating && <styledEl.Spinner />}
        </styledEl.Label>
        <styledEl.Content onClick={() => setOpen(!isOpen)}>
          {preHooksToDapp.length > 0 && (
            <styledEl.HookTag addSeparator={postHooksToDapp.length > 0}>
              PRE <b>{preHooksToDapp.length}</b>
            </styledEl.HookTag>
          )}
          {postHooksToDapp.length > 0 && (
            <styledEl.HookTag isPost>
              POST <b>{postHooksToDapp.length}</b>
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
          <HooksInfo data={preHooksToDapp} hooks={isTradeConfirmation ? hooks.preHooks : []} title="Pre Hooks" />
          <HooksInfo data={postHooksToDapp} hooks={isTradeConfirmation ? hooks.postHooks : []} title="Post Hooks" />
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
