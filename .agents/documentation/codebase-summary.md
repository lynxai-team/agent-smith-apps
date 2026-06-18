# agent-smith-apps — Debate Application

## Summary
A Vue 3 + Vite application that extends the Agent Smith UI dashboard with a multi-agent debate feature. The `debate` app enables structured discussions where an orchestrator coordinates multiple AI participants and advisors to explore topics through iterative dialogue, ultimately converging on conclusions based on user questions.

## Dependencies
- `@agent-smith/types` — Shared TypeScript interfaces (AgentState, HistoryTurn, ToolCallSpec, etc.)
- `@agent-smith/wscli` — WebSocket client for real-time communication with Agent Smith server
- `vue` (3.5.38) — Vue 3 framework with Composition API
- `@vueuse/core` — Vue composables (useStorage, useDebounce, etc.)
- `markstream-vue` — Markdown rendering with custom HTML tags and Mermaid support
- `mermaid` — Diagram generation for visual debate state representation
- `modprompt` — Prompt management utilities
- `restmix` — REST API client wrapper
- `vite` (8.0.16) — Build tool and dev server
- `typescript` (6.0.3) — TypeScript compiler

## Used By
- `agent-smith-ui` — Consumed as a plugin/app extension; registered in the Vue router under `/app/debate`
- End users — Interact with multi-agent debates via the Agent Smith web dashboard

## Entry Points
- `debate/src/main.ts` — Exports `AppComponent` and `AppSidebar` for UI integration
- `debate/package.json` — Package entry: `./dist/app-debate.js` (ESM), `./dist/app-debate.cjs` (CJS)
- `debate/src/AppComponent.vue` — Main debate view: conversation history, streaming output, prompt input
- `debate/src/AppSidebar.vue` — Sidebar for managing debates (list, edit, create debates)

## Key Files
| File | Purpose |
|------|---------|
| `debate/src/debate.ts` | Core composable `useDebate()` — orchestrates the debate flow, WebSocket integration, participant/advisor coordination (900+ lines) |
| `debate/src/interfaces.ts` | TypeScript interfaces: `Participant`, `Debate`, `OrchestratorMsg`, `DebateHistoryTurn` |
| `debate/src/main.ts` | Package entry point — exports `AppComponent` and `AppSidebar` |
| `debate/src/state.ts` | Reactive state management: debates registry, current debate, WebSocket sync with server API |
| `debate/src/conf.ts` | Default debate configurations: `general`, `fast`, `web-search` presets with participants/advisors |
| `debate/src/AppComponent.vue` | Main view: conversation history rendering, streaming output, tool call handling, prompt input |
| `debate/src/AppSidebar.vue` | Sidebar: debate list management (create, edit, open debates) |
| `debate/features/agents/*.yml` | YAML agent definitions: orchestrator, talk, advisor, search agents (12 files) |
| `debate/features/fragments/*.md` | Prompt fragments: orchestration logic, talk instructions |
| `debate/src/widgets/` | Vue widget components: ThinkingNode, ContentNode, ActionNode, ToNode, FormatedToolCall, AutoTextarea |
| `debate/src/components/vibe/toast/` | Toast notification system (SwToast, SwToastItem, composable) |
| `debate/cmds/debate.js` | Node.js CLI command for standalone debate execution |

## Architecture

### Debate Flow
The application implements a multi-agent debate pattern with three roles:

1. **Orchestrator** — Leads the debate, analyzes conversation state, decides next actions (ask participants, ask user, close)
2. **Participants** — Active debaters who respond to questions and contribute arguments based on their assigned roles
3. **Advisors** — Specialized consultants the orchestrator can query for specific expertise before making decisions

The flow follows this cycle:
```
User asks question → Orchestrator analyzes → Orchestrator directs participants/advisors → 
Participants/Advisors respond → Orchestrator evaluates progress → (loop) → Close with answer
```

### WebSocket Integration
- Uses `@agent-smith/wscli` (`useClientFeatures()`) for real-time bidirectional communication
- Handles streaming tokens, thinking phases, tool calls with user confirmation prompts
- Events: `onToken`, `onThinkingToken`, `onThink`, `onTurnEnd`, `onToolCall`, `onToolCallEnd`

### Vue Component Hierarchy
```
AppComponent (main debate view)
├── Conversation history (rendered turns from debate.state.history)
├── Streaming output (current turn with markdown rendering)
│   ├── MarkdownRender (markstream-vue with custom tags: think, action, content, to)
│   ├── ThinkingNode (thinking phase visualization)
│   └── FormatedToolCall (tool call display with user confirmation)
├── Prompt input (AutoTextarea with send/pause/stop/reset controls)
└── SwToast (notification system)

AppSidebar (debate management)
├── Debate list view
└── AppSidebarDebate (edit/create debate form)
```

### Agent YAML Architecture
Each agent is defined as a YAML feature file with:
- **Prompt templates** — System prompts with variable substitution (`{question}`, `{prompt}`, `{participants}`, `{advisors}`)
- **Model configuration** — LLM backend selection (`qwen4b`, `lfm8b`, `apollo`, `gemma-e4b`)
- **Inference parameters** — temperature, top_k, top_p, min_p, repeat_penalty
- **File includes** — `{file:../fragments/orchestrate.md}` for modular prompt composition

### Debate Presets
Three default configurations in `conf.ts`:
- **general** — Full debate with 5 participants (Ideas, Perspective, Critic, Orientation, Artist) + 3 advisors (Review, Prepare-debate, Summary)
- **fast** — Lightweight variant using smaller models (lfm1b, gemma-e2b) for quicker interactions
- **web-search** — Includes a web search agent with `searchweb` tool capability

### State Management
- Vue reactive state (`ref`/`reactive`) manages debate configuration, conversation history, and streaming output
- Debates persisted via server API (`/app/debate/conf`, `/app/debate/update`)
- Local storage sync for UI preferences (e.g., `openLiveThinking`)

## Related
- See `agent-smith/packages/types` — Shared interfaces (`AgentState`, `HistoryTurn`, `ToolCallSpec`) consumed by the debate composable
- See `agent-smith/packages/wscli` — WebSocket client providing `useClientFeatures()` for real-time agent communication
- See `agent-smith-ui/src/apps/` — Plugin system where this app is registered as a dashboard extension
- See `agent-smith/examples/features/agents/` — Reference YAML agent definitions (similar structure)

## Documentation
| Resource | Path |
|----------|------|
| This codebase summary | `.agents/documentation/codebase-summary.md` |
| Project navigation map | `../.agents/documentation/project-nav.md` |
| Root codebase summary | `../.agents/documentation/codebase-summary.md` |
| Agent Smith overview | `agent-smith/.agents/documentation/project-overview.md` |
