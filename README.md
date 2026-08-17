# dsh-usage-dashboard-plus

[English](README.md) | [中文](README.zh.md)

A fork of [dsh-usage-dashboard](https://www.npmjs.com/package/dsh-usage-dashboard) with **external vision-call accounting**: a sidebar-footer widget for [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) showing your **DeepSeek API balance** and **today's spend**, estimated from session logs.

This is now the only actively maintained usage-dashboard repository. The former `dsh-stats-dashboard` implementation has been fully merged into Plus; do not install both statistics plugins in the same profile.

## What "Plus" adds

- **Counts external vision-model calls** (e.g. `dsh-vision-fallback`'s Mimo V2.5 requests) into the today-spend stats via an optional JSONL usage log — the base package only counts calls recorded in DSH session logs.
- Bundles a **pricing entry for `mimo-v2.5`** (opencode Zen GO rates) so those calls get a cost estimate out of the box (override via `prices`).

## Features

- **API balance** — resolves the DeepSeek key through the DSH credentials service and queries the balance endpoint (cached).
- **Today's spend (est.)** — scans session logs (and the external usage log) for today's token usage × price table.
- **Sidebar footer widget** — `余额 ¥xx · 今日 ¥xx`, click to open a detail card (calls, tokens, per-model breakdown, pricing notes).
- **Peak/off-peak pricing schedule** — date-gated DeepSeek rate tables (2026-08-17 onward).
- **Full usage dashboard** — per-provider/per-model calls, latency, TTFT, throughput, input/output/cache tokens, cache rate, and estimated cost.
- **Call-log analysis** — filter and search by session, provider, and model; inspect recent calls and export filtered rows as CSV.
- **Inherited Stats implementation** — the `usageDashboard` session projection, 500-row call-log cap, whole-session model aggregates, and replay-safe historical statistics are included in Plus.
- **No build step** — host half (`lib/index.js`) + browser bundle (`lib/client.js`) via the `dsh.client` mechanism.

## Migrating from dsh-stats-dashboard

1. Remove or disable the old `dsh-stats-dashboard` plugin from the `web` profile.
2. Install `dsh-usage-dashboard-plus`.
3. Restart `dsh web` and hard-refresh the Settings page.

Plus reads the existing session logs, so historical sessions do not need to be migrated. Do not keep both statistics plugins enabled; the old repository is retained only as a historical source and is no longer maintained independently.

## Install

```sh
dsh plugin --profile web add dsh-usage-dashboard-plus
# restart `dsh web` — the profile patch layer is not hot-reloaded
```

Verify:

```sh
dsh --profile web --dump-config   # expect a usage-dashboard-plus row
```

Then hard-refresh the GUI (`Cmd+Shift+R`) — the footer widget appears next to 设置/Settings.

## Configuration

All settings live under the `usage-dashboard` namespace in `~/.dsh/settings.yaml` (hot-reloaded):

```yaml
usage-dashboard:
  apiKeyRef: DEEPSEEK_API_KEY      # credential ref for balance queries
  baseURL: ""                      # empty → $DEEPSEEK_BASE_URL → api.deepseek.com
  prices:                          # per-model CNY per 1M tokens (input/cacheRead/output)
    "mimo-v2.5": { input: 2, cacheRead: 0.05, output: 8 }
  priceSchedule: []                # date-gated peak/idle tables
  balanceCacheMs: 60000
  sessionsRoot: ""                 # default <dsh home>/sessions
  scanWindowMs: 172800000          # only scan session logs modified within this window
  externalUsageLog: ""             # JSONL log of external model calls
```

### External usage log (`externalUsageLog`)

`dsh-vision-fallback` (and other plugins that call models outside the DSH session-log pipeline) can append one JSON line per external call:

```json
{ "ts": 1755000000000, "model": "mimo-v2.5", "inputTokens": 1200, "outputTokens": 320, "cacheReadTokens": 0, "cacheWriteTokens": 0 }
```

Default path: `<dsh home>/vision-fallback/usage.jsonl`. Set `externalUsageLog: off` to disable.

## Development

```sh
# no build step; node --test tests/run-tests.mjs if you add tests
```

## License

MIT — forked from [dsh-usage-dashboard](https://github.com/1690834643/dsh-usage-dashboard) (MIT).
