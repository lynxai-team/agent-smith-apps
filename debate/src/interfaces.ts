import type { HistoryTurn, ToolTurn } from "@agent-smith/types";

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
    action: string;
    to: Array<string>;
    content: string | null;
}

interface DebateHistoryTurn extends HistoryTurn {
    from: Participant | "user";
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

export {
    Participant,
    OrchestratorMsg,
    DebateHistoryTurn,
    Debate,
}