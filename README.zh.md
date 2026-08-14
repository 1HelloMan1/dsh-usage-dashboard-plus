# dsh-usage-dashboard-plus

[English](README.md) | [中文](README.zh.md)

[dsh-usage-dashboard](https://www.npmjs.com/package/dsh-usage-dashboard) 的增强版（fork），核心新增：**外部视觉调用计入统计**。为 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) 提供侧边栏底部小部件：显示 **DeepSeek API 余额** 和 **今日花费（估算）**。

## Plus 新增了什么

- **统计外部视觉模型调用**（如 `dsh-vision-fallback` 触发的 Mimo V2.5 请求）：通过可选的 JSONL 用量日志并入今日花费——原版只统计 DSH 会话日志里的调用。
- 内置 **`mimo-v2.5` 计价条目**（opencode Zen GO 费率），开箱即可估算这些调用的费用（可用 `prices` 覆盖）。

## 功能

- **账户余额**：通过 DSH 凭证系统解析 DeepSeek key，查询余额接口（带缓存）。
- **今日花费（估算）**：扫描会话日志 + 外部用量日志，按 Token 用量 × 价目表估算。
- **侧边栏底部小部件**：`余额 ¥xx · 今日 ¥xx`，点击展开详情卡片（调用次数、Token、按模型明细、计价说明）。
- **峰/谷计价**：2026-08-17 起的 DeepSeek 分时段价目表。
- **无需构建**：host 半（`lib/index.js`）+ 浏览器 bundle（`lib/client.js`），走 `dsh.client` 机制。

## 安装

```sh
dsh plugin --profile web add dsh-usage-dashboard-plus
# 重启 `dsh web`（profile patch 层不支持热加载）
```

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
# 无需构建；如补充测试用 node --test tests/run-tests.mjs
```

## 许可证

MIT —— fork 自 [dsh-usage-dashboard](https://github.com/1690834643/dsh-usage-dashboard)（MIT）。
