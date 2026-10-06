# Monitoring

## Logs

Server code logs JSON lines to stdout with [pino](https://getpino.io) (`@/shared/lib/logger/index.server`). Every line has `service: "rwa-frontend"`, `env` (`VERCEL_ENV`), `level`, `time` and `msg`. `LOG_LEVEL` sets the minimum level (default `info`).

| `msg` | Source | Fields |
| --- | --- | --- |
| `upstream request` | `logCoingeckoRequests`, registered in `instrumentation.ts` | `upstream: "coingecko"`, `api` (`pro`, `demo`, `public`, `geckoterminal`), `endpoint` (e.g. `/coins/{id}/market_chart`), `method`, `status`, `outcome` (`ok`, `http_error`, `network_error`), `durationMs` |
| `api request` | `withRequestLogging` around every `/api/v1` handler | `route` (e.g. `/api/v1/chart/[ticker]`), `method`, `status`, `durationMs` |
| anything else at `error` | failed loads in `assetsService`, quotes and chart | `err`, plus context such as `ticker` and `chainId` |

`upstream request` is logged from the `undici` diagnostics channels, so it counts the requests that reach CoinGecko: Next data cache hits are not logged, and the background revalidations of stale entries are.

## Shipping to VictoriaLogs

Logs reach VictoriaLogs Staging (Grafana: [grafana.dev.cow.fi](https://grafana.dev.cow.fi)) through a Vercel log drain received by the staging Vector agents: `vercel_drain` and `vercel_to_kube_shape` in `cluster/staging/infra/vector.yaml` of the infrastructure repo, served at `https://vercel-logs.barn.cow.fi/vercel`.

Set up the drain in the Vercel project with NDJSON delivery, source **Functions**, that URL and an `Authorization: Basic <base64 of vercel:VERCEL_DRAIN_PASSWORD>` header. The password is in the `vector-staging` 1Password item.

Vector parses each pino line like a pod log, so it lands as `{namespace="vercel", container="<Vercel project>", pod="<deployment id>"}` with `_msg` set to `msg`, an upper-case `level` and every other field under `parsed.` (`parsed.endpoint`, `parsed.durationMs`, ...).

## Grafana dashboard

[`monitoring/coingecko-usage.dashboard.json`](../monitoring/coingecko-usage.dashboard.json) (LogsQL, VictoriaLogs data source, Staging by default) shows CoinGecko consumption (billed calls, a 30-day projection to compare with the plan credits, calls per minute, 429s, failures and latency by endpoint) and `/api/v1` traffic. Import it with **Dashboards → New → Import**. It stays empty until the drain delivers logs.
