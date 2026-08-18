# dsh-usage-dashboard-plus

[English](README.md) | [中文](README.zh.md)

[dsh-usage-dashboard](https://www.npmjs.com/package/dsh-usage-dashboard) 的增强版（fork），核心新增：**外部视觉调用计入统计**。为 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) 提供侧边栏底部小部件：显示 **DeepSeek API 余额** 和 **今日花费（估算）**。

本仓库也是当前唯一的统计看板维护仓库。原来的 `dsh-stats-dashboard` 功能已经完整合并到 Plus；不要在同一个 profile 中同时安装两个统计插件。

## Plus 新增了什么

- **统计外部视觉模型调用**（如 `dsh-vision-fallback` 触发的 Mimo V2.5 请求）：通过可选的 JSONL 用量日志并入今日花费——原版只统计 DSH 会话日志里的调用。
- 内置 **`mimo-v2.5` 计价条目**（opencode Zen GO 费率），开箱即可估算这些调用的费用（可用 `prices` 覆盖）。

## 功能

- **账户余额**：通过 DSH 凭证系统解析 DeepSeek key，查询余额接口（带缓存）。
- **今日花费（估算）**：扫描会话日志 + 外部用量日志，按 Token 用量 × 价目表估算。
- **侧边栏底部小部件**：`余额 ¥xx · 今日 ¥xx`，点击展开详情卡片（调用次数、Token、按模型明细、计价说明）。
- **峰/谷计价**：2026-08-17 起的 DeepSeek 分时段价目表。
- **完整统计看板**：按 provider / model 汇总调用次数、响应耗时、TTFT、吞吐量、输入/输出/缓存 Token、缓存率和费用估算。
- **调用日志与分析**：按会话、provider、model 筛选和搜索，保留最近调用明细，并支持 CSV 导出。
- **Stats 功能已继承**：`usageDashboard` session projection、500 条调用日志上限、全量模型聚合和历史会话重放统计均已包含在 Plus 中。
- **无需构建**：host 半（`lib/index.js`）+ 浏览器 bundle（`lib/client.js`），走 `dsh.client` 机制。

## 从 dsh-stats-dashboard 迁移

1. 从 `web` profile 中移除或停用旧的 `dsh-stats-dashboard`。
2. 安装 `dsh-usage-dashboard-plus`。
3. 重启 `dsh web` 并强制刷新设置页。

Plus 会继续读取已有会话日志；不需要迁移历史会话数据，也不需要同时保留旧 Stats 插件。旧仓库仅作为历史来源保留，已经停止独立维护。

## 安装

```sh
dsh plugin --profile web add dsh-usage-dashboard-plus
# 重启 `dsh web`（profile patch 层不支持热加载）
```

npm 包内置 `dsh.bundle` 与 `cordis.patch.yml`，安装命令会自动把 `usage-dashboard` 插入目标 profile，不需要手工复制插件目录或编辑 patch。

验证：

```sh
dsh --profile web --dump-config   # 应出现 usage-dashboard-plus 行
```

然后强制刷新 GUI（`Cmd+Shift+R`）——侧边栏底部「设置」旁会出现小部件。

## 配置

配置在 `~/.dsh/settings.yaml` 的 `usage-dashboard` 命名空间下（热加载）：

```yaml
usage-dashboard:
  apiKeyRef: DEEPSEEK_API_KEY      # 查询余额用的凭证引用
  baseURL: ""                      # 空 → $DEEPSEEK_BASE_URL → api.deepseek.com
  prices:                          # 每模型 CNY / 每 1M tokens（input/cacheRead/output）
    "mimo-v2.5": { input: 2, cacheRead: 0.05, output: 8 }
  priceSchedule: []                # 分时段峰/谷价目表
  balanceCacheMs: 60000
  sessionsRoot: ""                 # 默认 <dsh home>/sessions
  scanWindowMs: 172800000          # 只扫描此时间窗内修改过的会话日志
  externalUsageLog: ""             # 外部模型调用用量日志（JSONL）
```

### 外部用量日志（`externalUsageLog`）

`dsh-vision-fallback` 等插件在 DSH 会话日志管线之外调用模型时，可向该文件追加 JSONL，每行一条外部调用：

```json
{ "ts": 1755000000000, "model": "mimo-v2.5", "inputTokens": 1200, "outputTokens": 320, "cacheReadTokens": 0, "cacheWriteTokens": 0 }
```

默认路径：`<dsh home>/vision-fallback/usage.jsonl`。设为 `off` 可关闭。

## 开发

```sh
npm test    # 校验 npm 包、dsh.bundle 和 cordis.patch.yml
```

## 许可证

MIT —— fork 自 [dsh-usage-dashboard](https://github.com/1690834643/dsh-usage-dashboard)（MIT）。
