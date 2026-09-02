import { AssistantMessage, AssistantTurn, AssistantUiContext } from '../types'

/**
 * ⚠️ Hardcoded deliberately, and temporarily.
 *
 * The assistant backend is a separate deployment (nlp-demo), because putting it in
 * this monorepo would mean changing CoW Swap's build and deploy configuration and
 * adding an Anthropic key to CoW's own Vercel project — a much bigger ask than an
 * evaluation warrants. The URL is not a secret; the API key lives server-side.
 *
 * TODO: move to an env var (`import.meta.env.VITE_ASSISTANT_API`) if this is
 * adopted, at which point the right end state is `/api` on the same origin and
 * this module goes away entirely.
 */
const ASSISTANT_API = 'https://nlp-demo-bice.vercel.app/api/conversation'

interface StreamCallbacks {
  /** Assistant prose, as it arrives. */
  onText?(delta: string): void
  /** What the backend is doing — "Reading the docs", "Looking up tokens". */
  onStatus?(label: string): void
}

interface StreamOptions extends StreamCallbacks {
  messages: AssistantMessage[]
  signal?: AbortSignal
  uiContext: AssistantUiContext
}

interface StreamOutcome {
  failure: string | null
  result: AssistantTurn | null
}

/**
 * One conversation turn, streamed.
 *
 * Resolves with the full turn once the `done` event arrives. Rejects if the stream
 * ends without one — the caller must then roll its history back, because a turn
 * that never completed left no assistant reply in the transcript, and sending two
 * user messages in a row is an invalid conversation.
 */
export async function streamConversation(options: StreamOptions): Promise<AssistantTurn> {
  const reader = await openStream(options)
  const decoder = new TextDecoder()
  const outcome: StreamOutcome = { result: null, failure: null }
  let buffer = ''

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Frames are separated by a blank line; the tail may be a partial frame.
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''

    frames.forEach((frame) => applyFrame(frame, options, outcome))
  }

  if (outcome.failure) throw new Error(outcome.failure)
  if (!outcome.result) throw new Error('The connection dropped before that finished.')

  return outcome.result
}

/** Apply one frame to the callbacks and the running outcome. */
function applyFrame(frame: string, callbacks: StreamCallbacks, outcome: StreamOutcome): void {
  const parsed = parseFrame(frame)
  if (!parsed) return

  const { event, data } = parsed

  if (event === 'text') callbacks.onText?.(data.delta)
  else if (event === 'status') callbacks.onStatus?.(data.label)
  else if (event === 'done') outcome.result = data as unknown as AssistantTurn
  else if (event === 'error') outcome.failure = data.error || 'Something went wrong.'
}

/** Post the turn and hand back a reader, or throw with something readable. */
async function openStream(options: StreamOptions): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const { messages, uiContext, signal } = options

  const response = await fetch(ASSISTANT_API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, uiContext, stream: true }),
    signal,
  })

  if (!response.ok) {
    const body: { error?: string } = await response.json().catch(() => ({}))
    throw new Error(body.error || `Assistant request failed (${response.status})`)
  }

  if (!response.body) throw new Error('Streaming is not supported in this browser.')

  return response.body.getReader()
}

/**
 * Read one SSE frame. Returns null for comments and keepalives.
 *
 * Deliberately minimal: the backend only ever sends single-line `data:` payloads,
 * because JSON.stringify escapes newlines.
 */
function parseFrame(frame: string): { data: Record<string, string>; event: string } | null {
  let event = 'message'
  let raw: string | null = null

  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) raw = line.slice(5).trim()
  }

  if (raw === null) return null

  try {
    return { event, data: JSON.parse(raw) }
  } catch {
    return null
  }
}
