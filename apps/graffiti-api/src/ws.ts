import { WebSocketServer, WebSocket } from 'ws'

import type { FastifyInstance } from 'fastify'

export interface DiffMessage {
  type: 'diff'
  seq: number
  cells: Array<[number, number, number]> // [x, y, rgb]
}

export type ServerMessage = DiffMessage | StatsMessage

export interface StatsMessage {
  type: 'stats'
  paintersOnline: number
}

export interface WsHubOptions {
  path: string
  maxClients: number
  heartbeatMs: number
  /** Allowed Origin header values, or ["*"] to accept any. */
  allowedOrigins: string[]
}

/**
 * Drop a client whose outbound buffer exceeds this, rather than letting a
 * stalled socket grow the server's memory without bound.
 */
const MAX_BUFFERED_BYTES = 4 * 1024 * 1024

/**
 * WebSocket hub. Broadcasts {type:"diff"} on every accepted draw and
 * {type:"stats"} whenever the painter count changes.
 */
export class WsHub {
  readonly wss: WebSocketServer
  private clients = new Set<WebSocket>()
  private alive = new WeakMap<WebSocket, boolean>()
  private heartbeat: NodeJS.Timeout

  constructor(
    app: FastifyInstance,
    private readonly options: WsHubOptions,
  ) {
    this.wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 })

    app.server.on('upgrade', (req, socket, head) => {
      const { pathname } = new URL(req.url ?? '/', 'http://localhost')
      if (pathname !== options.path) {
        socket.destroy()
        return
      }
      if (!this.originAllowed(req.headers.origin)) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
        socket.destroy()
        return
      }
      if (this.clients.size >= options.maxClients) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n')
        socket.destroy()
        return
      }
      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.wss.emit('connection', ws, req)
      })
    })

    this.wss.on('connection', (ws) => {
      this.clients.add(ws)
      this.alive.set(ws, true)
      ws.on('pong', () => this.alive.set(ws, true))
      this.send(ws, this.statsMessage())
      this.broadcast(this.statsMessage())
      ws.on('close', () => {
        this.clients.delete(ws)
        this.broadcast(this.statsMessage())
      })
      ws.on('error', () => {
        /* connection errors surface as close */
      })
    })

    // Without this, half-open sockets linger forever: they inflate the painter
    // count and hold memory until the process restarts.
    this.heartbeat = setInterval(() => this.sweep(), options.heartbeatMs)
    this.heartbeat.unref()
  }

  private originAllowed(origin: string | undefined): boolean {
    if (this.options.allowedOrigins.includes('*')) return true
    if (!origin) return false
    return this.options.allowedOrigins.includes(origin)
  }

  private sweep(): void {
    for (const ws of this.clients) {
      if (this.alive.get(ws) === false) {
        ws.terminate()
        this.clients.delete(ws)
        continue
      }
      this.alive.set(ws, false)
      ws.ping()
    }
  }

  paintersOnline(): number {
    return this.clients.size
  }

  private statsMessage(): StatsMessage {
    return { type: 'stats', paintersOnline: this.paintersOnline() }
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    this.sendRaw(ws, JSON.stringify(msg))
  }

  private sendRaw(ws: WebSocket, data: string): void {
    if (ws.readyState !== WebSocket.OPEN) return
    if (ws.bufferedAmount > MAX_BUFFERED_BYTES) {
      ws.terminate()
      this.clients.delete(ws)
      return
    }
    ws.send(data)
  }

  broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg)
    for (const ws of this.clients) this.sendRaw(ws, data)
  }

  broadcastDiff(seq: number, cells: Array<{ x: number; y: number; rgb: number }>): void {
    this.broadcast({
      type: 'diff',
      seq,
      cells: cells.map((c) => [c.x, c.y, c.rgb] as [number, number, number]),
    })
  }

  close(): void {
    clearInterval(this.heartbeat)
    for (const ws of this.clients) ws.terminate()
    this.clients.clear()
    this.wss.close()
  }
}
