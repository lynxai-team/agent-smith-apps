[![npm package](https://img.shields.io/npm/v/@agent-smith/app-debate)](https://www.npmjs.com/package/@agent-smith/app-debate)

# @agent-smith/app-debate — Multi-Agent Debate Application

A Vue 3 + Vite application that extends the [Agent Smith](https://github.com/lynxai-team/agent-smith) UI dashboard with structured multi-agent debates. The debate app enables AI-powered discussions where an orchestrator coordinates multiple participants and advisors to explore topics through iterative dialogue, ultimately converging on conclusions based on user questions.

## Features

🎭 **Multi-Agent Orchestration** — An intelligent orchestrator leads debates, analyzing conversation state and directing participants or advisors

🗣️ **Role-Based Participants** — Multiple AI agents with distinct roles (Ideas, Perspective, Critic, Orientation, Artist) contribute specialized arguments

💡 **Expert Advisors** — Specialized consultants the orchestrator queries for specific expertise before making decisions

🔄 **Real-Time Streaming** — WebSocket-based bidirectional communication with streaming tokens, thinking phases, and tool call confirmations

📊 **Visual State Representation** — Mermaid charts render debate progress and state visually

⚙️ **Configurable Presets** — Three default configurations: `general` (full debate), `fast` (lightweight), and `web-search` (with search tool)

🛠️ **Tool Integration** — Participants can use tools like web search, with user confirmation prompts for write operations

## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the debate application

### For Humans
- [Agent Smith Apps](https://github.com/lynxai-team/agent-smith-apps) — Repository on GitHub
- [Frontend Docs — Applications](https://lynxai-team.github.io/agent-smith/frontend/6.apps) — How to install and use pluggable applications

## Installation

The `agent-smith-apps` repository is installed as a plugin to the Agent Smith UI dashboard. Clone it alongside the UI repository and run the install script:

```bash
cd agent-smith-env
git clone https://github.com/lynxai-team/agent-smith-apps.git

# Navigate to the UI directory and install the debate app
cd agent-smith-ui
node scripts/installapp.js debate
```

Once installed the debate app is available in the frontend

### Package Dependencies

```bash
npm install @agent-smith/app-debate
```

**Runtime dependencies:**
- `@agent-smith/types` — Shared TypeScript interfaces
- `@agent-smith/wscli` — WebSocket client for server communication
- `vue` (3.5+) — Vue 3 framework
- `@vueuse/core` — Vue composables
- `markstream-vue` — Markdown rendering with custom tags
- `mermaid` — Diagram generation
- `restmix` — REST API client wrapper

## Quick Start

Add a question to start a debate. The orchestrator will analyze the question, coordinate participants, and converge on an answer:

```javascript
import { useDebate } from '@agent-smith/app-debate/src/debate';

const debate = useDebate();

// Configure with a preset
debate.configure(debates['general']);

// Run the debate with a question
const result = await debate.run(
    'Is artificial general intelligence likely to be achieved within the next decade?'
);
```

## Usage

### Creating and Managing Debates

The application maintains a reactive state of debates, persisted via the server API:

```typescript
import { 
    debates, 
    currentDebate, 
    openDebate, 
    closeDebate, 
    addDebate, 
    deleteDebate 
} from '@agent-smith/app-debate/src/state';

// Open an existing debate
openDebate('general');

// Close the current debate
closeDebate();

// Add a new debate configuration
addDebate({
    id: 'my-debate',
    name: 'My Custom Debate',
    orchestrator: { id: 'leader', name: 'Leader', model: 'qwen4b', role: 'leader' },
    participants: {},
    advisors: {}
});

// Delete a debate
deleteDebate(currentDebate.debate);
```

### Using the Core Composable

The `useDebate()` composable is the heart of the application:

```typescript
import { useDebate } from '@agent-smith/app-debate/src/debate';
import type { Debate } from '@agent-smith/app-debate/src/interfaces';

const debate = useDebate();

// Initialize with component context
await debate.init(
    scrollOutput,           // Function to handle scroll behavior
    customHtmlTags,         // Array of custom HTML tag names for markstream
    thinkingNodes,          // Ref<ParsedNode[]> for thinking visualization
    toolCallRequest,        // Ref<boolean> for tool call confirmation UI
    hasThinking             // Ref<boolean> for thinking phase indicator
);

// Run the debate
await debate.run('What are the implications of quantum computing?');
```

### Debate Lifecycle

```typescript
const debate = useDebate();

// 1. Configure with a debate definition
debate.configure(debates['general']);

// 2. Run with a question
await debate.run('Is remote work more productive than office work?');

// 3. Handle user input during pause (orchestrator may ask for clarification)
await debate.continueWithInput('Please consider the impact on junior employees');

// 4. Pause/resume the debate
debate.pause();
// ... user provides input ...
debate.endPause();

// 5. Stop the debate early
await debate.stop();

// 6. Reset state for a new debate
debate.reset();
```

### Accessing Debate State

```typescript
import { debate, debates, currentDebate, openLiveThinking } from '@agent-smith/app-debate/src/state';

// Current debate configuration
const config = currentDebate.debate;

// Full conversation history
const history = debate.state.history;

// Streaming output (current turn)
const stream = debate.stream;

// Parsed markdown nodes for rendering
const nodes = debate.nodes;

// Whether the orchestrator has asked for user input
const isPaused = debate.isPause;
```

### Available Debate Presets

Three default configurations are included in `debate/src/conf.ts`:

| Preset | Description | Participants | Advisors | Models |
|--------|-------------|--------------|----------|--------|
| `general` | Full debate with 5 roles + 3 advisors | Ideas, Perspective, Critic, Orientation, Artist | Review, Prepare-debate, Summary | qwen4b, lfm8b, apollo, gemma-e4b |
| `fast` | Lightweight variant for quick interactions | Ideas, Perspective, Critic, Orientation | Review | qwen4b, lfm1b, gemma-e2b |
| `web-search` | Includes web search capability | Web search agent + 5 standard roles | Review, Summary | qwen4b, lfm8b, apollo, gemma-e4b |

## Complete Example

A full working example demonstrating all major operations:

```typescript
import { useDebate } from '@agent-smith/app-debate/src/debate';
import { debates } from '@agent-smith/app-debate/src/conf';
import type { DebateHistoryTurn } from '@agent-smith/app-debate/src/interfaces';

async function runDebateExample() {
    const debate = useDebate();
    
    // Configure with the general preset
    debate.configure(debates['general']);
    
    // Initialize the composable (called once per component mount)
    await debate.init(
        () => console.log('scroll'),           // scrollOutput callback
        ['think', 'action', 'content', 'to'],  // customHtmlTags
        { value: [] } as any,                  // thinkingNodes ref
        { value: false } as any,              // toolCallRequest ref
        { value: false } as any               // hasThinking ref
    );
    
    // Run the debate with a question
    const result = await debate.run(
        'Should AI systems have legal personhood?'
    );
    
    console.log('Debate completed:', result);
    
    // Access the full conversation history
    for (const turn of debate.state.history as DebateHistoryTurn[]) {
        console.log(`[${turn.from === 'user' ? 'User' : turn.from?.name}] ${turn.content}`);
        if (turn.think) {
            console.log(`  Thinking: ${turn.think}`);
        }
        if (turn.orchestratorMsg) {
            console.log(`  Orchestrator: ${JSON.stringify(turn.orchestratorMsg)}`);
        }
    }
    
    // Reset for a new debate
    debate.reset();
}

runDebateExample().catch(console.error);
```

## API Reference

### `useDebate()` — Core Composable Factory

Creates and returns the debate orchestration state machine.

```typescript
function useDebate(): DebateInstance
```

**Returns:** `DebateInstance` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `state` | `Readonly<Reactive>` | Reactive debate state: name, orchestrator, participants, advisors, history, talking |
| `stream` | `Ref<string>` | Current streaming token output |
| `nodes` | `Ref<ParsedNode[]>` | Parsed markdown structure for rendering |
| `isPause` | `Ref<boolean>` | Whether the debate is paused waiting for user input |
| `onReady` | `Awaiter<boolean>` | Promise that resolves when WebSocket service is ready |

| Method | Signature | Description |
|--------|-----------|-------------|
| `configure` | `(deb: Debate) => void` | Set the debate configuration (orchestrator, participants, advisors) |
| `init` | `(scrollOutput, customHtmlTags, thinkingNodes, toolCallRequest, hasThinking) => Promise<void>` | Initialize WebSocket service and event handlers |
| `run` | `(question: string, iterations?: number) => Promise<{ prompt: string }>` | Start the debate with a question; orchestrator loops until closed |
| `route` | `() => Promise<void>` | Process the orchestrator's last message (ask participants/advisors/user or close) |
| `pause` | `() => void` | Pause the debate, waiting for user input via `continueWithInput()` |
| `endPause` | `() => void` | Resume from pause |
| `continueWithInput` | `(txt: string) => Promise<void>` | Provide user input during a paused debate |
| `stop` | `() => Promise<void>` | Stop the debate immediately |
| `reset` | `() => void` | Clear history and reset state for a new debate |

### TypeScript Interfaces

```typescript
interface Participant {
    id: string;
    name: string;
    model: string;
    role: string;
    nothink?: boolean;
    tools?: Array<string>;
}

interface Debate {
    id: string;
    name: string;
    orchestrator: Participant;
    participants: Record<string, Participant>;
    advisors: Record<string, Participant>;
}

interface OrchestratorMsg {
    action: 'ask' | 'close';
    to: Array<string>;
    content: string | null;
}

interface DebateHistoryTurn extends HistoryTurn {
    from: Participant | 'user';
    content: string;
    orchestratorMsg?: OrchestratorMsg;
    state: {
        showThinking: boolean;
        showToolResponses: Array<string>;
        confirmRestartAtTurn: number | null;
        confirmToolCalls: Record<string, {
            resolve: (value: boolean) => void;
            reject: (reason?: any) => void;
        }>;
    };
}
```

### State Exports

```typescript
import { 
    debate,           // Current DebateInstance
    debates,          // Record<string, Debate> — all configured debates
    currentDebate,    // Reactive wrapper for the active debate
    isReady,          // Ref<boolean> — whether state is initialized
    onStateReady,     // Awaiter — resolves when server state is synced
    mainapp,          // Reactive { state: AgentState } — shared agent state
    openLiveThinking, // Ref<boolean> — toggle thinking visualization (persisted)
    initState,        // Function to initialize from server state
    openDebate,       // Function to open a debate by ID
    closeDebate,      // Function to close the current debate
    addDebate,        // Function to add a new debate
    deleteDebate      // Function to delete a debate
} from '@agent-smith/app-debate/src/state';
```

### UI Components

```typescript
import AppComponent from '@agent-smith/app-debate/src/AppComponent.vue';
import AppSidebar from '@agent-smith/app-debate/src/AppSidebar.vue';

// AppComponent — Main debate view (conversation history, streaming output, prompt input)
// AppSidebar — Sidebar for managing debates (create, edit, open)
```

## Important Notes

⚠️ **Browser Runtime** — This application runs in the browser as part of the Agent Smith UI dashboard. It requires a running Agent Smith server with WebSocket support.

🔌 **Plugin Integration** — The debate app is installed as a plugin to `agent-smith-ui`. It registers itself under the `/app/debate` route in the Vue router.

📡 **WebSocket Dependency** — Real-time features require an active connection to the Agent Smith server via `@agent-smith/wscli`. Ensure the server is running before starting debates.

🧠 **Model Requirements** — Debates require LLM backends configured in the Agent Smith server (e.g., `qwen4b`, `lfm8b`, `apollo`, `gemma`). The orchestrator and participants each use their own model configuration.

🔒 **Tool Confirmations** — When participants use tools that modify state, the server uses a confirmation pattern (`createAwaiter<T>()`) requiring user approval before execution.

## Related Packages

- [`@agent-smith/types`](https://github.com/lynxai-team/agent-smith) — Shared TypeScript interfaces for agents, tools, callbacks, and WebSocket protocol
- [`@agent-smith/wscli`](https://github.com/lynxai-team/agent-smith) — WebSocket client providing `useClientFeatures()` for real-time agent communication
- [`agent-smith-ui`](https://github.com/lynxai-team/agent-smith) — Vue 3 + PrimeVue dashboard where this app is registered

## License

MIT
