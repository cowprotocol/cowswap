import { WebSocketServer, WebSocket } from "ws";
import type { FastifyInstance } from "fastify";

export interface DiffMessage {
  type: "diff";
  seq: number;
  cells: Array<[number, number, number]>; // [x, y, rgb]
}

export interface StatsMessage {
  type: "stats";
  paintersOnline: number;
}

export type ServerMessage = DiffMessage | StatsMessage;

/**
 * WebSocket hub mounted at /ws. Broadcasts {type:"diff"} on every accepted
 * draw and {type:"stats"} whenever the painter count changes.
 */
export class WsHub {
  readonly wss: WebSocketServer;
  private clients = new Set<WebSocket>();

  constructor(app: FastifyInstance, path = "/ws") {
    this.wss = new WebSocketServer({ noServer: true });
    app.server.on("upgrade", (req, socket, head) => {
      const { pathname } = new URL(req.url ?? "/", "http://localhost");
      if (pathname !== path) {
        socket.destroy();
        return;
      }
      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.wss.emit("connection", ws, req);
      });
    });
    this.wss.on("connection", (ws) => {
      this.clients.add(ws);
      this.send(ws, this.statsMessage());
      this.broadcast(this.statsMessage());
      ws.on("close", () => {
        this.clients.delete(ws);
        this.broadcast(this.statsMessage());
      });
      ws.on("error", () => {
        /* ignore */
      });
    });
  }

  paintersOnline(): number {
    return this.clients.size;
  }

  private statsMessage(): StatsMessage {
    return { type: "stats", paintersOnline: this.paintersOnline() };
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }

  broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    for (const ws of this.clients) if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }

  broadcastDiff(seq: number, cells: Array<{ x: number; y: number; rgb: number }>): void {
    this.broadcast({
      type: "diff",
      seq,
      cells: cells.map((c) => [c.x, c.y, c.rgb] as [number, number, number]),
    });
  }
}
