window.__ModuleLoader__.load({
	id: "dsh-usage-dashboard",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region styles
		const css = ".ud-widget{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:8px;cursor:pointer;color:var(--dsw-alias-label-secondary);user-select:none;min-width:0}.ud-widget:hover{background:var(--dsw-alias-interactive-bg-hover)}.ud-main{display:flex;align-items:baseline;gap:4px;font-size:12px;line-height:1.4;white-space:nowrap;min-width:0}.ud-label{color:var(--dsw-alias-label-secondary);font-size:11px}.ud-value{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}.ud-value.ud-warn{color:var(--dsw-alias-state-warn-primary)}.ud-refresh{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none;padding:0}.ud-refresh:hover{background:var(--dsw-alias-interactive-bg-hover)}.ud-refresh.ud-spin svg{animation:ud-spin .8s linear infinite}@keyframes ud-spin{to{transform:rotate(360deg)}}.ud-collapsed{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0;font-size:13px;font-weight:600;font-family:inherit}.ud-collapsed:hover{background:var(--dsw-alias-interactive-bg-hover)}.ud-card{position:fixed;z-index:1000;min-width:250px;max-width:330px;padding:12px 14px;border-radius:12px;background:var(--dsw-alias-bg-overlay,#222327);color:var(--dsw-alias-label-primary);box-shadow:0 8px 30px rgba(0,0,0,.35);font-size:12px;line-height:1.65}.ud-card h4{margin:0 0 6px;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);letter-spacing:.02em}.ud-row{display:flex;justify-content:space-between;gap:14px;align-items:baseline}.ud-row+.ud-row{margin-top:2px}.ud-muted{color:var(--dsw-alias-label-secondary)}.ud-note{margin-top:8px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l);color:var(--dsw-alias-label-secondary);font-size:11px}.ud-err{color:var(--dsw-alias-state-error-primary)}.ud-loading{opacity:.55}";
		const tagId = "dsh-usage-dashboard/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-usage-dashboard";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region locales
		const NS = "usage-dashboard";
		/** Simplified Chinese dictionary (key-set source of truth). */
		const zh = {
			"balance": "余额",
			"today": "今日花费",
			"refresh": "刷新",
			"loading": "加载中…",
			"unavailable": "获取失败",
			"balanceTitle": "DeepSeek 账户余额",
			"balanceTotal": "可用余额",
			"balanceRecharge": "充值",
			"balanceGrant": "赠送",
			"todayTitle": "今日花费（估算）",
			"calls": "调用次数",
			"tokens": "Token 用量",
			"tokensHint": "输入 / 输出 / 缓存读取",
			"modelTitle": "按模型",
			"pricing": "计价",
			"notice": "按 DeepSeek 官方定价估算（可在 cordis.patch.yml 的 prices 中调整）；不含联网搜索、标题生成等未记录用量的调用。",
			"retry": "点击刷新"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"balance": "Balance",
			"today": "Today",
			"refresh": "Refresh",
			"loading": "Loading…",
			"unavailable": "Unavailable",
			"balanceTitle": "DeepSeek Account Balance",
			"balanceTotal": "Available",
			"balanceRecharge": "Topped up",
			"balanceGrant": "Granted",
			"todayTitle": "Today's Spend (est.)",
			"calls": "Calls",
			"tokens": "Tokens",
			"tokensHint": "Input / Output / Cache read",
			"modelTitle": "By model",
			"pricing": "Pricing",
			"notice": "Estimated at official DeepSeek rates (adjustable under prices in cordis.patch.yml); excludes calls without logged usage (web search, title generation).",
			"retry": "Click to refresh"
		};
		//#endregion
		//#region helpers
		function fmt(n, digits) {
			return Number.isFinite(n) ? n.toLocaleString("zh-CN", { minimumFractionDigits: digits, maximumFractionDigits: digits }) : "—";
		}
		function fmtTokens(n) {
			if (!Number.isFinite(n)) return "—";
			if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
			if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
			return String(n);
		}
		/** Fetch /api/dsh-usage; auto-refresh every 60s. */
		function useUsage() {
			const [state, setState] = react.useState({ phase: "loading", data: null, error: null });
			const abortRef = react.useRef(null);
			const load = react.useCallback(async () => {
				abortRef.current?.abort();
				const ctrl = new AbortController();
				abortRef.current = ctrl;
				setState((prev) => ({ ...prev, phase: prev.data === null ? "loading" : "refreshing" }));
				try {
					const res = await fetch("/api/dsh-usage", { signal: ctrl.signal, cache: "no-store" });
					if (!res.ok) throw new Error("HTTP " + res.status);
					const json = await res.json();
					if (json === null || typeof json !== "object" || json.ok !== true) throw new Error(json && json.error ? json.error : "bad response");
					setState({ phase: "ready", data: json, error: null });
				} catch (error) {
					if (error && error.name === "AbortError") return;
					setState((prev) => ({ phase: "error", data: prev.data, error: error instanceof Error ? error.message : String(error) }));
				}
			}, []);
			react.useEffect(() => {
				load();
				const timer = window.setInterval(load, 60000);
				return () => {
					window.clearInterval(timer);
					abortRef.current?.abort();
				};
			}, [load]);
			return { state, load };
		}
		//#endregion
		//#region UsageWidget
		/**
		* Sidebar footer item: API balance + today's spend. Wide mode shows the
		* two readouts inline (click toggles a detail card); collapsed mode
		* shows a compact "¥" button with a hover tooltip.
		*/
		function UsageWidget({ wide, t }) {
			const { state, load } = useUsage();
			const [open, setOpen] = react.useState(false);
			const [cardAt, setCardAt] = react.useState(null);
			const rootRef = react.useRef(null);
			const { data, phase, error } = state;
			const ready = data !== null;
			const bal = ready ? data.balance : null;
			const today = ready ? data.today : null;
			const total = bal !== null && bal !== void 0 && Number.isFinite(bal.totalBalance) ? bal.totalBalance : null;
			const todayCost = today !== null && today !== void 0 && Number.isFinite(today.cost) ? today.cost : null;
			const spinning = phase === "loading" || phase === "refreshing";
			const showWarn = todayCost !== null && total !== null && todayCost > total;
			const toggleCard = () => {
				if (!open) {
					const rect = rootRef.current?.getBoundingClientRect();
					setCardAt(rect ? { left: rect.left, top: rect.bottom + 6 } : null);
				}
				setOpen((prev) => !prev);
			};
			react.useEffect(() => {
				if (!open) return;
				const onKey = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				const onPointer = (event) => {
					if (rootRef.current !== null && !rootRef.current.contains(event.target)) setOpen(false);
				};
				document.addEventListener("keydown", onKey);
				document.addEventListener("pointerdown", onPointer);
				return () => {
					document.removeEventListener("keydown", onKey);
					document.removeEventListener("pointerdown", onPointer);
				};
			}, [open]);
			const valueLine = (label, value, warn) => (0, react_jsx_runtime.jsxs)("div", {
				className: "ud-main",
				children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-label", children: label }), (0, react_jsx_runtime.jsx)("span", { className: "ud-value" + (warn ? " ud-warn" : ""), children: value })]
			});
			const refreshBtn = (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ud-refresh" + (spinning ? " ud-spin" : ""),
				"aria-label": t("refresh"),
				title: t("refresh"),
				onClick: (event) => {
					event.stopPropagation();
					load();
				},
				children: (0, react_jsx_runtime.jsx)(_primitives.IconRefreshOutline16, { size: 14 })
			});
			if (!wide) {
				const tip = bal !== null && bal !== void 0 && bal.error
					? t("unavailable")
					: t("balance") + " ¥" + (total === null ? "—" : fmt(total, 2)) + " · " + t("today") + " ¥" + (todayCost === null ? "—" : fmt(todayCost, 2));
				return (0, react_jsx_runtime.jsx)(_primitives.Tooltip, {
					label: tip,
					delayMs: 400,
					disabled: open,
					children: (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						ref: rootRef,
						className: "ud-collapsed" + (spinning ? " ud-loading" : ""),
						"aria-label": tip,
						onClick: toggleCard,
						children: "¥"
					})
				});
			}
			if (!ready) {
				return (0, react_jsx_runtime.jsxs)("div", {
					className: "ud-widget" + (spinning ? " ud-loading" : ""),
					ref: rootRef,
					children: [valueLine(t("balance"), "…"), valueLine(t("today"), "…"), refreshBtn]
				});
			}
			const card = open ? (0, react_jsx_runtime.jsx)("div", {
				className: "ud-card",
				style: cardAt ? { left: Math.max(8, cardAt.left), top: cardAt.top } : void 0,
				onClick: (event) => event.stopPropagation(),
				children: [
					(0, react_jsx_runtime.jsx)("h4", { children: t("balanceTitle") }),
					(0, react_jsx_runtime.jsx)("div", {
						className: "ud-row",
						children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: t("balanceTotal") }), (0, react_jsx_runtime.jsx)("span", { children: bal && bal.error ? (0, react_jsx_runtime.jsx)("span", { className: "ud-err", children: t("unavailable") }) : "¥" + fmt(total, 2) + " " + (bal ? bal.currency : "") })]
					}),
					bal && !bal.error && (0, react_jsx_runtime.jsx)("div", {
						className: "ud-row",
						children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: t("balanceRecharge") + " / " + t("balanceGrant") }), (0, react_jsx_runtime.jsx)("span", { children: "¥" + fmt(bal.toppedUpBalance, 2) + " / ¥" + fmt(bal.grantedBalance, 2) })]
					}),
					bal && bal.error && (0, react_jsx_runtime.jsx)("div", {
						className: "ud-row",
						children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: t("refresh") }), (0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: t("retry") })]
					}),
					(0, react_jsx_runtime.jsx)("h4", { children: t("todayTitle") }),
					(0, react_jsx_runtime.jsx)("div", {
						className: "ud-row",
						children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: t("calls") }), (0, react_jsx_runtime.jsx)("span", { children: today ? String(today.calls) : "—" })]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: "ud-row",
						children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: t("tokens") }), (0, react_jsx_runtime.jsx)("span", { children: today ? fmtTokens(today.tokens.input) + " / " + fmtTokens(today.tokens.output) + " / " + fmtTokens(today.tokens.cacheRead) : "—" })]
					}),
					today && today.byModel.length > 0 && (0, react_jsx_runtime.jsx)("div", {
						children: [(0, react_jsx_runtime.jsx)("h4", { children: t("modelTitle") }), ...today.byModel.map((m) => (0, react_jsx_runtime.jsx)("div", {
							className: "ud-row",
							children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: m.model + " · " + m.calls }), (0, react_jsx_runtime.jsx)("span", { children: "¥" + fmt(m.cost, 2) })]
						}, m.model))]
					}),
					data.pricingLabel && (0, react_jsx_runtime.jsx)("div", {
						className: "ud-row",
						children: [(0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: t("pricing") }), (0, react_jsx_runtime.jsx)("span", { className: "ud-muted", children: data.pricingLabel })]
					}),
					(0, react_jsx_runtime.jsx)("div", { className: "ud-note", children: t("notice") })
				]
			}) : null;
			return (0, react_jsx_runtime.jsxs)(react.Fragment, {
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: "ud-widget" + (spinning ? " ud-loading" : ""),
						ref: rootRef,
						role: "button",
						tabIndex: 0,
						"aria-expanded": open,
						onClick: toggleCard,
						onKeyDown: (event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								toggleCard();
							}
						},
						children: [valueLine(t("balance"), total === null ? "—" : "¥" + fmt(total, 2), showWarn), valueLine(t("today"), todayCost === null ? "—" : "¥" + fmt(todayCost, 2), showWarn), refreshBtn]
					}),
					card
				]
			});
		}
		//#endregion
		//#region index
		const inject = ["slots", "locale"];
		/** Register the footer widget: dictionaries + a `sidebar.footer.action` item. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "usage-dashboard: dictionaries");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "usage-dashboard",
				locale: NS
			}, UsageWidget));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
