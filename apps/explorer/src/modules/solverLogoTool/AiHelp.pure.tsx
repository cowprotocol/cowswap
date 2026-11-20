import { ReactElement, useRef, useState } from 'react'

import { aiPrompt } from './aiHelp.utils'
import { AiDetails, ToolButton } from './solverLogoTool.styled'
import { SolverLogoController } from './useSolverLogoTool'

export function AiHelp({ tool }: { tool: SolverLogoController }): ReactElement | null {
  const [copyStatus, setCopyStatus] = useState('')
  const [copiedPrompt, setCopiedPrompt] = useState('')
  const textarea = useRef<HTMLTextAreaElement>(null)
  if (!tool.asset || tool.sampleKey) return null
  const prompt = aiPrompt({ name: tool.solverName.trim() || 'Solver', asset: tool.asset, state: tool.transform })
  const copy = async (): Promise<void> => {
    setCopiedPrompt(prompt)
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyStatus('Prompt copied. Paste it into your chat with the AI pack attached.')
    } catch {
      textarea.current?.focus()
      textarea.current?.select()
      setCopyStatus('Clipboard access is unavailable. The prompt is selected; copy it with your keyboard.')
    }
  }
  return (
    <AiDetails>
      <summary>
        Get AI help <span>Optional · ChatGPT or Claude</span>
      </summary>
      <p>Want a hand with the fit? Give your assistant the logo, guidelines and visual examples in one pack.</p>
      <ol>
        <li>Download the AI pack.</li>
        <li>Open a chat and attach the pack. If ZIPs aren’t supported, unzip it and attach the files.</li>
        <li>Copy and paste the prompt below.</li>
      </ol>
      <div className="ai-actions">
        <ToolButton
          variant="secondary"
          disabled={!!tool.exporting || tool.loading}
          onClick={(): void => {
            void tool.exportPack('ai')
          }}
        >
          {tool.exporting === 'ai' ? 'Preparing AI pack…' : 'Download AI pack'}
        </ToolButton>
        <ToolButton
          variant="secondary"
          onClick={(): void => {
            void copy()
          }}
        >
          Copy prompt
        </ToolButton>
      </div>
      <div className="ai-providers">
        <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">
          Open ChatGPT ↗
        </a>
        <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">
          Open Claude ↗
        </a>
      </div>
      <p>Opens a separate chat. Your logo isn’t sent automatically; you choose what to share.</p>
      <label htmlFor="solver-logo-ai-prompt">Prompt for your assistant</label>
      <textarea ref={textarea} id="solver-logo-ai-prompt" readOnly spellCheck={false} rows={6} value={prompt} />
      {copyStatus && copiedPrompt === prompt && <p role="status">{copyStatus}</p>}
      {tool.status.includes('-ai-help.zip') && <p role="status">{tool.status}</p>}
    </AiDetails>
  )
}
