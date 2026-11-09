import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { loadConfig, MAX_BOX_HEIGHT, MAX_BOX_WIDTH } from "./config.js";
import { CanvasState } from "./canvas.js";
import { openStore } from "./store.js";
import { encodePng } from "./png.js";
import { DrawVerifier } from "./verify.js";
import { ClaimService } from "./claims.js";
import { WsHub } from "./ws.js";
import path from "node:path";
import fs from "node:fs";

async function main(): Promise<void> {
  const config = loadConfig();
  const store = openStore(config.dbPath);
  const canvas = new CanvasState(store);
  const verifier = new DrawVerifier(config, store);
  const claims = new ClaimService(config, store);

  const app = Fastify({ logger: true, bodyLimit: 8 * 1024 * 1024 });

  // CORS (open — the canvas is public; useful for mobile claim landing pages).
  app.addHook("onRequest", async (req, reply) => {
    reply.header("access-control-allow-origin", "*");
    reply.header("access-control-allow-headers", "content-type");
    reply.header("access-control-allow-methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return reply.send();
  });

  const hub = new WsHub(app, "/v1/ws");

  app.get("/v1/canvas.png", async (_req, reply) => {
    reply.type("image/png");
    reply.header("cache-control", "no-store");
    return reply.send(encodePng(canvas.width, canvas.height, canvas.buf));
  });

  app.get("/v1/info", async () => ({
    width: canvas.width,
    height: canvas.height,
    maxBoxWidth: MAX_BOX_WIDTH,
    maxBoxHeight: MAX_BOX_HEIGHT,
    mint: config.mint,
    treasury: claims.treasuryPubkey(),
    network: config.network,
    feePayerHint: claims.treasuryPubkey(),
    devInsecure: config.devInsecure,
  }));

  app.get("/v1/cells", async (req) => {
    const q = req.query as { since?: string };
    const since = Number.parseInt(String(q.since ?? "0"), 10) || 0;
    const rows = store.getCellsSince(since);
    return {
      seq: rows.length > 0 ? rows[rows.length - 1].seq : since,
      cells: rows.map((r) => [r.x, r.y, r.rgb]),
    };
  });

  app.post<{ Body: { txSignature?: string; signature?: string; walletPubkey: string; cells: unknown[] } }>(
    "/v1/draw",
    async (req, reply) => {
      const body = req.body ?? ({} as typeof req.body);
      if (!body.walletPubkey || typeof body.walletPubkey !== "string")
        return reply.code(400).send({ ok: false, reason: "walletPubkey required" });
      const validated = canvas.validateCells(body.cells);
      if (!validated.ok) return reply.code(400).send({ ok: false, reason: validated.reason });
      if (validated.cells.length > config.maxCellsPerDraw)
        return reply
          .code(400)
          .send({ ok: false, reason: `too many cells (max ${config.maxCellsPerDraw})` });

      const cost = validated.cells.length;
      const result = await verifier.verify({
        txSignature: body.txSignature ?? body.signature ?? null,
        walletPubkey: body.walletPubkey,
        costCells: cost,
      });
      if (!result.ok) return reply.code(400).send({ ok: false, reason: result.reason });

      const seq = canvas.applyDraw(validated.cells);
      hub.broadcastDiff(seq, validated.cells);
      app.log.info(
        { seq, cells: cost, wallet: body.walletPubkey, burned: result.burned },
        "draw applied"
      );
      return { ok: true, seq };
    }
  );

  app.get<{ Params: { code: string } }>("/v1/claim/:code", async (req) => claims.check(req.params.code));

  app.post<{ Body: { code: string; walletPubkey: string } }>("/v1/claim", async (req, reply) => {
    const body = req.body ?? ({} as typeof req.body);
    if (!body.code || !body.walletPubkey)
      return reply.code(400).send({ ok: false, reason: "code and walletPubkey required" });
    const result = await claims.claim(body.code, body.walletPubkey);
    if (!result.ok) return reply.code(result.status).send({ ok: false, reason: result.reason });
    return { ok: true, txSignature: result.txSignature, amount: result.amount };
  });

  // Ops endpoint to pre-generate claim codes. Guarded by ADMIN_TOKEN when set.
  app.post<{ Body: { n?: number; amount?: number } }>(
    "/v1/admin/claims",
    async (req, reply) => {
      if (config.adminToken) {
        const auth = req.headers.authorization ?? "";
        if (auth !== `Bearer ${config.adminToken}`)
          return reply.code(401).send({ ok: false, reason: "unauthorized" });
      }
      const n = Math.min(Math.max(Number(req.body?.n ?? 1), 1), 1000);
      const amount = Math.max(Number(req.body?.amount ?? 1000), 1);
      const codes = claims.generate(n, amount);
      return { ok: true, codes: codes.map((code) => ({ code, amount })) };
    }
  );

  app.get("/v1/stats", async () => ({ paintersOnline: hub.paintersOnline() }));

  // Client-side error sink: the page reports paint-flow failures here so they
  // land in api.log / SQLite with enough context to debug.
  app.post<{ Body: { message?: string; phase?: string; wallet?: string; detail?: string } }>(
    "/v1/client-errors",
    async (req, reply) => {
      const b = req.body ?? {};
      if (!b.message) return reply.code(400).send({ ok: false, reason: "message required" });
      store.logClientError({
        message: String(b.message).slice(0, 2000),
        phase: b.phase ?? null,
        wallet: b.wallet ?? null,
        detail: b.detail ? String(b.detail).slice(0, 4000) : null,
      });
      app.log.warn({ phase: b.phase, wallet: b.wallet }, `client error: ${b.message}`);
      return { ok: true };
    },
  );

  // Serve the built frontend (same origin → relative /v1 works, no CORS).
  const staticDir = process.env.STATIC_DIR ?? "";
  if (staticDir && fs.existsSync(path.join(staticDir, "index.html"))) {
    await app.register(fastifyStatic, {
      root: path.resolve(staticDir),
      prefix: "/",
    });
    // SPA fallback: anything that is not /v1 and not a real file → index.html
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith("/v1") || req.url.startsWith("/ws")) {
        return reply.code(404).send({ ok: false, reason: "not found" });
      }
      return reply.sendFile("index.html");
    });
    app.log.info({ staticDir }, "serving frontend");
  }

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, "shutting down");
    hub.wss.close();
    await app.close();
    store.close();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await app.listen({ port: config.port, host: "0.0.0.0" });
  app.log.info(
    {
      port: config.port,
      network: config.network,
      mint: config.mint,
      store: store.kind,
      devInsecure: config.devInsecure,
    },
    "graffiti-api up"
  );
  if (config.devInsecure) {
    app.log.warn("DEV_INSECURE=1 — on-chain burn verification DISABLED");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
