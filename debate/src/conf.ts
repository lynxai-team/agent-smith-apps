import type { Debate } from "./interfaces";

const defaultDebates: Record<string, Debate> = {
    "general": {
        "id": "general",
        "name": "General",
        "orchestrator": {
            "id": "leader",
            "name": "Leader",
            "model": "qwen4b",
            "template": "chatml",
            "role": "leader",
            "nothink": false
        },
        "participants": {
            "ideas": {
                "id": "ideas",
                "name": "Ideas",
                "model": "lfm8b",
                "template": "lfm",
                "role": "creative and imaginative participant that brainstorms ideas"
            },
            "perspective": {
                "id": "perspective",
                "name": "Perspective",
                "model": "apollo",
                "template": "chatml",
                "role": "take distance and provide a larger general dialectical and philosophical, ethical and epistemological perspective about the debate while helping getting to a conclusion"
            },
            "critic": {
                "id": "critic",
                "name": "Critic",
                "model": "apollo",
                "template": "chatml",
                "role": "review and critic, check if clarifications are needed (we can ask the user), take a broader perspective and help you partners getting to a conclusion",
                "nothink": false
            },
            "orientation": {
                "id": "orientation",
                "name": "Orientation",
                "model": "gemma-e4b",
                "template": "gemma4",
                "role": "evaluate the debate's progress and orientation to help leading to a conclusion",
                "nothink": false
            },
            "artist": {
                "id": "artist",
                "name": "Artist",
                "model": "qwen4b",
                "template": "chatml",
                "role": "an artist that can provide a visual synthetic representation of the state of debate and it's progress using a Mermaid chart",
                "nothink": true,
                "tools": []
            }
        },
        "advisors": {
            "review": {
                "id": "review",
                "name": "Review",
                "model": "qwen4b",
                "template": "chatml",
                "role": "evaluate the debate's progress to see how far we are from getting to a conclusion regarding to answering the user's question",
                "nothink": true
            },
            "prepare-debate": {
                "id": "prepare-debate",
                "name": "Prepare debate",
                "model": "gemma-e4b",
                "template": "gemma",
                "role": "when the debate starts analyze the user request: break down all it's logical implications and constraints. You don't answer the debate's question directly, you must provide a detached an outline to the leader about how to structure the debate",
                "nothink": false
            },
            "summary": {
                "id": "summary",
                "name": "Summary",
                "model": "gemma-e4b",
                "template": "gemma",
                "role": "provide a concise summary of the debate",
                "nothink": false,
                "tools": []
            }
        }
    },
    "fast": {
        "id": "fast",
        "name": "Fast",
        "orchestrator": {
            "id": "leader",
            "name": "Leader",
            "model": "qwen4b",
            "template": "chatml",
            "role": "leader",
            "nothink": true
        },
        "participants": {
            "ideas": {
                "id": "ideas",
                "name": "Ideas",
                "model": "lfm1b",
                "template": "lfm",
                "role": "brainstorm ideas"
            },
            "perspective": {
                "id": "perspective",
                "name": "Perspective",
                "model": "lfm1b",
                "template": "lfm",
                "role": "take distance and provide a larger general dialectical and philosophical perspective about the debate while helping getting to a conclusion"
            },
            "critic": {
                "id": "critic",
                "name": "Critic",
                "model": "gemma-e2b",
                "template": "gemma4",
                "role": "review and critic, check if clarifications are needed (we can ask the user), take a broader perspective and help you partners getting to a conclusion",
                "nothink": false
            },
            "orientation": {
                "id": "orientation",
                "name": "Orientation",
                "model": "lfm1b",
                "template": "lfm",
                "role": "evaluate the debate's progress and orientation to help leading to a conclusion",
                "nothink": true
            }
        },
        "advisors": {
            "review": {
                "id": "review",
                "name": "Review",
                "model": "qwen4b",
                "template": "chatml",
                "role": "advanced analyze and evaluate it's progress to see how far we are from getting to a conclusion - Important: use these advices only before atempting to close a debate when it has been discussed between the participants",
                "nothink": true
            }
        }
    },
    "web-search": {
        "id": "web-search",
        "name": "Web search",
        "orchestrator": {
            "id": "leader",
            "name": "Leader",
            "model": "qwen4b",
            "template": "chatml",
            "role": "leader",
            "nothink": false
        },
        "participants": {
            "web-search-agent": {
                "id": "web-search-agent",
                "name": "Web search agent",
                "model": "qwen4b",
                "template": "chatml-xmltools",
                "role": "find information on the web and provide a report",
                "nothink": false,
                "tools": [
                    "searchweb"
                ]
            },
            "ideas": {
                "id": "ideas",
                "name": "Ideas",
                "model": "lfm8b",
                "template": "lfm",
                "role": "creative and imaginative participant that brainstorms ideas"
            },
            "perspective": {
                "id": "perspective",
                "name": "Perspective",
                "model": "apollo",
                "template": "chatml",
                "role": "take distance and provide a larger general dialectical and philosophical, ethical and epistemological perspective about the debate while helping getting to a conclusion"
            },
            "critic": {
                "id": "critic",
                "name": "Critic",
                "model": "apollo",
                "template": "chatml",
                "role": "review and critic, check if clarifications are needed (we can ask the user), take a broader perspective and help you partners getting to a conclusion",
                "nothink": false
            },
            "orientation": {
                "id": "orientation",
                "name": "Orientation",
                "model": "gemma-e4b",
                "template": "gemma4",
                "role": "evaluate the debate's progress and orientation to help leading to a conclusion",
                "nothink": false
            },
            "artist": {
                "id": "artist",
                "name": "Artist",
                "model": "qwen4b",
                "template": "chatml",
                "role": "an artist that can provide a visual synthetic representation of the state of debate and it's progress using a Mermaid chart",
                "nothink": true,
                "tools": []
            }
        },
        "advisors": {
            "review": {
                "id": "review",
                "name": "Review",
                "model": "qwen4b",
                "template": "chatml",
                "role": "evaluate the debate's progress to see how far we are from getting to a conclusion regarding to answering the user's question",
                "nothink": true
            },
            "summary": {
                "id": "summary",
                "name": "Summary",
                "model": "gemma-e4b",
                "template": "gemma4",
                "role": "provide a concise summary of the debate",
                "nothink": false,
                "tools": []
            }
        }
    }
};

export {
    defaultDebates,
}