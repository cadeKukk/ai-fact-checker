# Harness and runtime citation audit

Checked 2026-09-02. Scope: the six agent harnesses and three local runtimes added in commit `a84ecdf`, their seven new organization descriptions, and the directly related lesson, glossary and fact-check text.

## Evidence and claim decisions

The 42 dated records in `web/data/catalogSources.ts` link to first-party documentation or the projects' own repositories. Every catalog capability has its own `sources` array (28 capabilities); every myth has a source. Model-level sources cover descriptions, supported configurations, limitations and pricing qualifications. Capability ratings remain editorial judgments, explicitly distinguished from documented feature availability.

| Entry | Primary evidence | Corrections and remaining uncertainty |
| --- | --- | --- |
| Codex | [CLI](https://learn.chatgpt.com/docs/codex/cli), [local providers](https://learn.chatgpt.com/docs/developer-commands?surface=cli), [open-source scope](https://learn.chatgpt.com/docs/open-source), [pricing](https://learn.chatgpt.com/docs/pricing) | Removed model-lock claim: CLI supports Ollama and LM Studio. Open-source badge refers to the CLI; cloud and IDE extension are not open source. Product/model naming clarified with GPT-5-Codex documentation. |
| Claude Code | [overview](https://code.claude.com/docs/en/overview), [subagents](https://code.claude.com/docs/en/sub-agents), [teams](https://code.claude.com/docs/en/agent-teams), [memory](https://code.claude.com/docs/en/memory), [permissions](https://code.claude.com/docs/en/permissions) | Teams explicitly experimental. Removed unsupported subagent launch year, claims about the proportion of coding gains due to harness work, comparative autonomy, and “hidden tool-call tokens.” Supported-provider model configuration replaces an absolute lock-in claim. |
| Cursor Agent | [agent tools](https://cursor.com/docs/agent/overview), [API keys](https://cursor.com/help/models-and-usage/api-keys), [search](https://cursor.com/docs/agent/tools/search), [plans](https://cursor.com/pricing) | Arbitrary localhost support is **unverified**, not declared impossible. API-key docs describe backend routing and feature restrictions. Removed a local-only privacy implication and unsupported claims about which models users usually choose. |
| Aider | [repository](https://github.com/Aider-AI/aider), [git](https://aider.chat/docs/git.html), [repo map](https://aider.chat/docs/repomap.html), [Ollama](https://aider.chat/docs/llms/ollama.html) | Auto-commits are configurable, not guaranteed. Removed “no GUI,” universal API compatibility, and comparative token-efficiency/autonomy claims. Local compute is not cost-free. |
| Cline | [repository](https://github.com/cline/cline), [local models](https://docs.cline.bot/running-models-locally/overview), [approval modes](https://docs.cline.bot/features/auto-approve) | IDEs, CLI, Apache license and local providers documented. Approval varies with settings; removed “every command” and “safest default” guarantees. |
| OpenHands | [repository](https://github.com/OpenHands/OpenHands), [local models](https://docs.openhands.dev/openhands/usage/llms/local-llms), [automations](https://docs.openhands.dev/openhands/usage/agent-canvas/prebuilt-automations) | Repository now describes Agent Canvas. Execution backend is configurable; removed the claim of a sandbox by default. Local tool-use reliability is conditional. Current cloud prices are not asserted. |
| LM Studio | [engines](https://lmstudio.ai/docs/app), [MCP](https://lmstudio.ai/docs/app/mcp), [headless](https://lmstudio.ai/docs/developer/core/headless), [offline](https://lmstudio.ai/docs/app/offline), [terms](https://lmstudio.ai/app-terms), [pricing](https://lmstudio.ai/pricing) | Supports MCP tools in chat and headless operation; removed inference-only/headless limitations. MLX speed superiority is **unverified**. Desktop licensing, CLI licensing and model licenses are distinct; local features and paid plans are qualified separately. |
| Ollama | [repository](https://github.com/ollama/ollama), [API](https://docs.ollama.com/api/openai-compatibility), [FAQ](https://docs.ollama.com/faq), [imports](https://docs.ollama.com/import) | Supports concurrent requests. Quantization varies by model/import; removed universal 4-bit default, blanket engine architecture, market-share and speed claims. API compatibility is partial; local-only privacy does not apply to cloud models or external tools. |
| llama.cpp | [repository](https://github.com/ggml-org/llama.cpp), [server](https://github.com/ggml-org/llama.cpp/tree/master/tools/server) | Documents hardware backends, GGUF inference, web UI and server controls. Removed “any GGUF,” no model-download support, “free forever,” format-invention attribution and universal speed/hardware rankings. |

## Explicitly unresolved

- The historical release dates already stored for these nine entries are not established by the cited feature documentation. They remain in the data for follow-up, but the detail UI shows “Release date unverified.” An editor release, initial commit, CLI launch and cloud launch are not interchangeable dates.
- Founding years and headquarters for the seven new organizations were not established by this feature audit. Their organization pages visibly flag the metadata instead of displaying it as verified.
- No comparative benchmarks establish the previous runtime speed rankings, token-efficiency rankings or safety superlatives. Those claims were removed or explicitly marked unverified. Existing numerical ratings are labeled editorial.
- The generic text/code modalities represent common use. Supported inputs, context limits, performance and memory needs depend on the selected model and configuration.

## Citation behavior

`SourceLinks` reuses the lesson citation pattern: a Sources divider, descriptive linked title and external-link icon. Links work with keyboard focus and open a new tab using `noopener noreferrer`; screen readers receive that context. `CatalogEvidence` shows dated verification notes and sources both on detail pages and inside model popups. Existing Sources tabs and source-detail popups remain available.

The central source index now includes capability, myth and lesson citations, deduplicated by URL. The three directly related fact-check answers, two advanced lesson sections and two glossary explanations were reconciled with the catalog so cross-links do not reintroduce the corrected claims. The Cursor/local-provider fact check is medium confidence because arbitrary local Cursor support remains unresolved.

## Validation

- TypeScript check and optimized Next.js production build passed (15 pages generated).
- Data checks passed for all nine entries, all 28 capability source mappings, myth citations, 42 dated primary-source records, lesson inclusion and central-index URL deduplication.
- Browser checks confirmed catalog/claim links, visible uncertainty notes, model-popup citations and actual new-tab navigation to the intended authoritative URL. No browser console errors were recorded on the runtime page.
