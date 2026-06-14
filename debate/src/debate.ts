import type { ClientFeaturesOptions, ClientFeaturesService, HistoryTurn, ToolCallSpec, ToolTurn } from "@agent-smith/types";
import { useClientFeatures } from "@agent-smith/wscli";
import { getMarkdown, parseMarkdownToStructure, type ParsedNode } from "markstream-vue";
import { nextTick, reactive, ref, type Ref } from "vue";
import type { Debate, DebateHistoryTurn, OrchestratorMsg, Participant } from "./interfaces.js";
import { createAwaiter, extractBetweenTags } from "./utils.js";

const useDebate: CallableFunction = () => {
    let nTurn = 0;
    let nTokens = ref(0);
    const continueDebate = ref<boolean>(true);
    const stream = ref("");
    const nodes = ref<ParsedNode[]>([]);
    let customHtmlTags = new Array<string>();
    let srv: ClientFeaturesService;
    let question = "";
    let orchestratorMsg: OrchestratorMsg = { action: "", to: [], content: null };
    const isPause = ref(false);
    let pauseAw = createAwaiter<boolean>();
    const debug: boolean = false;
    const options: ClientFeaturesOptions = { debug: debug, nohistory: true };
    const onReady = createAwaiter<boolean>();
    let md = getMarkdown(undefined, { customHtmlTags: customHtmlTags });
    let nToolCalls = 0;
    let _isContinueWithInput = false;
    let _isReset = false;
    let scrollOutput = () => null;

    const state = reactive<{
        name: string;
        orchestrator: Participant,
        participants: Record<string, Participant>,
        advisors: Record<string, Participant>,
        history: Array<DebateHistoryTurn>,
        talking: Participant,
    }>({
        name: "",
        orchestrator: {} as Participant,
        participants: {},
        advisors: {},
        history: new Array<DebateHistoryTurn>(),
        talking: {} as Participant,
    });

    const configure = (deb: Debate) => {
        state.name = deb.name;
        state.orchestrator = deb.orchestrator;
        state.participants = deb.participants;
        state.advisors = deb.advisors;
    }

    const init = async (
        scrollOutput: CallableFunction,
        _customHtmlTags: Array<string>,
        thinkingNodes: Ref<ParsedNode[]>,
        toolCallRequest: Ref<boolean>,
        hasThinking: Ref<boolean>,
    ) => {
        customHtmlTags = _customHtmlTags;
        scrollOutput = scrollOutput;
        md = getMarkdown(undefined, { customHtmlTags: customHtmlTags });
        //const res = await api.get("/debate/init");
        //console.log("RES", res);
        srv = useClientFeatures({
            onStartThinking: (from: string) => {
                hasThinking.value = true;
                //console.log("START T")
            },
            onEndThinking: (from: string) => {
                stream.value = "";
                thinkingNodes.value = [];
            },
            onThinkingToken: (t: string, from: string) => {
                // @ts-ignore
                thinkingNodes.value = parseMarkdownToStructure(stream.value, md, {
                    final: true,
                    //requireClosingStrong: true,
                });
                stream.value += t;
                scrollOutput();
            },
            onToken: (t: string, from: string) => {
                ++nTokens.value;
                if (toolCallRequest.value) {
                    return
                }
                stream.value = stream.value + t;
                nodes.value = parseMarkdownToStructure(stream.value, md, {
                    customHtmlTags: customHtmlTags,
                    //preTransformTokens,
                    final: false,
                    requireClosingStrong: true,
                })
                scrollOutput()
            },
            onThink: (txt: string, from: string) => {
                //console.log("THINK", txt);
                state.history[state.history.length - 1].think = txt;
                nextTick(async () => { stream.value = ""; });
                scrollOutput(true, 100)
            },
            onTurnEnd: (h: HistoryTurn, from: string) => {
                const currentTurn = state.history[state.history.length - 1];
                //console.log("TURN END", currentTurn);
                /*if (typeof currentTurn.from != "string") {
                    if (currentTurn?.from?.tools) {
                        for (const t of currentTurn.from.tools) {
                            if (!t?.response) {
                                // looks like a subagent call, skip
                                return
                            }
                        }
                    }
                };*/
                if (nToolCalls == 0) {
                    state.talking = {} as Participant;
                }
                //console.log("INF RES", h);
                stream.value = "";
                nodes.value = [];
                if (h?.assistant) {
                    let c = h.assistant;
                    //const ff = splitThinking(c, "<think>", "</think>");
                    if (c.includes("<action>")) {
                        let t = "<action>" + c.split("<action>")[1];
                        orchestratorMsg = decodeOrchestratorMsg(t);
                        if (orchestratorMsg.content) {
                            const currentTurn = state.history[state.history.length - 1];
                            currentTurn.orchestratorMsg = orchestratorMsg;
                            currentTurn.content = orchestratorMsg.content;
                            /*const t: DebateHistoryTurn = {
                                from: toRaw(state.orchestrator),
                                orchestratorMsg: orchestratorMsg,
                                content: orchestratorMsg.content,
                                state: {
                                    showThinking: false,
                                    showToolResponses: [],
                                    confirmRestartAtTurn: null,
                                    confirmToolCalls: {},
                                },
                            }
                            pushTurnToHistory(t, "onInferenceResult orch msg")*/
                        } else {
                            throw new Error("orchestrator msg: no content")
                        }
                    } else {
                        //console.log("FINAL ANS", c);
                        let isObserving = false;
                        if (c.includes("<response>") || c.includes("</response>")) {
                            c = c.replaceAll("<response>", "").replaceAll("</response>", "").trim()
                        }
                        if (c.includes("<observing>") || c.includes("</observing>")) {
                            if (c == "<observing></observing>") {
                                isObserving = true;
                                c = "";
                            }
                            c = c.replaceAll("<observing>", "").replaceAll("</observing>", "").trim()
                            if (h.assistant.startsWith("<observing>")) {
                                isObserving = true
                            }
                        }
                        const m = c.length > 0 ?
                            isObserving ? "Observing: " + c : c :
                            "Observing";
                        const currentTurn = state.history[state.history.length - 1];
                        currentTurn.content = m;
                        if (h?.think) {
                            currentTurn.think = h.think
                        }
                        //pushTurnToHistory(t)
                    }
                } /*else {
                    throw new Error(`no assistant: ${JSON.stringify(h, null, 2)}`)
                }*/
                //console.log("INF RES", h);
                //unblock(true)
                scrollOutput()
                //debate.route(h.assistant)
            },
            onToolsTurnStart: (tcs: Array<ToolCallSpec>, from: string) => {
                toolCallRequest.value = true;
                hasThinking.value = false;
            },
            onToolsTurnEnd: (tt: Array<ToolTurn>, from: string) => {
                toolCallRequest.value = false;
            },
            onToolCall: (tc: ToolCallSpec, type: string, from: string) => {
                //console.log("TOOL CALL", tc);
                const currentTurn = state.history[state.history.length - 1];
                if (!currentTurn) {
                    throw new Error("no current turn")
                }
                if (!currentTurn?.tools) {
                    currentTurn.tools = new Array<ToolTurn>();
                };
                let tindex: number | null = null;
                let i = 0;
                for (const t of currentTurn.tools) {
                    //console.log("TCIDS", t.call.id == tc.id, t.call.id, tc.id)
                    if (t.call.id == tc.id) {
                        tindex = i;
                        break
                    };
                    ++i
                }
                //console.log("TI", tindex)
                if (tindex === null) {
                    const t: ToolTurn = {
                        call: { id: tc.id, name: tc.name, arguments: tc.arguments },
                        response: null,
                        from: from,
                        type: type
                    };
                    /*console.log("Current turn pre:", toRaw(currentTurn.tools));
                    console.log("ADD TOOL TO CURRENT TURN", t);
                    console.log("Current turn post:", toRaw(currentTurn.tools));*/
                    currentTurn.tools.push(t);
                    currentTurn.state.showToolResponses = []
                }
                //currentTurn.tools.push({ call: tc, response: null });
                scrollOutput();
            },
            onToolCallEnd: (tc: ToolCallSpec, tr: any, type: string, from: string) => {
                //console.log("END TOOL CALL", id, tr);
                const currentTurn = state.history[state.history.length - 1];
                if (!currentTurn?.tools) {
                    //console.log("CURRENT TURN", currentTurn);
                    throw new Error("no current turn tools")
                };
                let tindex: number | null = null;
                let i = 0;
                for (const t of currentTurn.tools) {
                    //console.log("TR", t.call.id == id, t.call.id, id)
                    if (t.call.id == tc.id) {
                        tindex = i;
                        break
                    };
                    ++i
                }
                if (tindex === null) {
                    throw new Error(`tool call id ${tc.id} not found in current turn: ${JSON.stringify(currentTurn)}`)
                }
                currentTurn.tools[tindex].response = tr;
                stream.value = ""
            },
            /*onTurnEnd: (ht: HistoryTurn) => {
                
                stream.value = "";
                nodes.value = [];
            },*/
        });
        await srv.checkState();
        onReady.unblock(true);
    }

    const route = async () => {
        const action = orchestratorMsg.action;
        const content = orchestratorMsg.content;
        const to = orchestratorMsg.to;
        //console.log("ACTION", action, "/MSG:", orchestratorMsg);
        if (action == "close") {
            continueDebate.value = false
            return
        } else if (action == "ask") {
            let i = 0;
            for (const pn of to) {
                if (isPause.value === true) {
                    //console.log("ROUTE PAUSE");
                    await pauseAw.awaiter;
                    //console.log("END ROUTE PAUSE");
                    if (_isContinueWithInput) {
                        // redirect the user input to the leader
                        break
                    }
                    if (_isReset) {
                        return
                    }
                    pauseAw = pauseAw;
                }
                ++i;
                console.log(">>", action, pn, i, "/", to.length);
                if (pn == "user") {
                    //console.log("ASK USER PAUSE");
                    pause();
                    await pauseAw.awaiter;
                    scrollOutput();
                    //console.log("END ASK USER PAUSE");
                    return
                }
                let isAdvisor = false;
                let participant: Participant | null = null;
                for (const [n, p] of Object.entries(state.participants)) {
                    if (n == pn || p.name.toLowerCase() == pn.toLowerCase()) {
                        participant = p;
                        break;
                    }
                }
                if (!participant) {
                    for (const [n, p] of Object.entries(state.advisors)) {
                        if (n == pn || p.name.toLowerCase() == pn.toLowerCase()) {
                            participant = p;
                            break;
                        }
                    }
                    isAdvisor = true;
                }
                if (!participant) {
                    throw new Error(`participant or advisor ${pn} not found`);
                }
                const ins = `question for ${participant.name}: ${content}`;
                state.talking = participant;
                await answer(participant, ins, isAdvisor);
                //console.log("END ASK ANSWER", pn);
                stream.value = "";
            }
            //await orchestrate();
        } else {
            throw new Error(`unknown action type ${action}. Msg: ${JSON.stringify(orchestratorMsg, null, 2)}`)
        }
    };

    const orchestrate = async (start = false) => {
        if (isPause.value === true) {
            //console.log("ORCH PAUSE");
            await pauseAw.awaiter;
            if (_isReset) {
                return
            }
            //console.log("END ORCH PAUSE");
        }
        state.talking = state.orchestrator;
        //console.log("ORCH", state.orchestrator)
        let isAgent = false;
        let t = "debate-orchestrator";
        if (state.orchestrator?.tools?.includes("searchweb")) {
            t = "debate-orchestrator-search";
            isAgent = true;
        }
        //console.log("LOAD", t);
        await srv.load(t, isAgent);
        //console.log("ORCH Q", question);
        if (start) {
            pushTurnToHistory({
                from: "user",
                content: question,
                state: {
                    showThinking: false,
                    showToolResponses: [],
                    confirmRestartAtTurn: null,
                    confirmToolCalls: {},
                }
            }, "orchestrate (user)");
        }
        pushTurnToHistory({
            from: state.orchestrator,
            content: "",
            state: {
                showThinking: false,
                showToolResponses: [],
                confirmRestartAtTurn: null,
                confirmToolCalls: {},
            }
        }, "orchestrate");
        nTurn++;
        const ps = new Array<string>();
        for (const p of Object.values(state.participants)) {
            ps.push(p.name + ` (or ${p.id}, role: ${p.role})`);
        }
        const ad = new Array<string>();
        for (const p of Object.values(state.advisors)) {
            ad.push(p.name + ` (or ${p.id}, role: ${p.role})`);
        }
        //console.log("PS", ps);
        //console.log("AD", ad);
        const pr = start ? "The conversation has not started yet" : formatHistory();
        if (question.length == 0) {
            throw new Error("no question")
        }
        /*if (!start) {
            console.log("----------------- H ------------------");
            console.log(pr)
            console.log("--------------------------------------");
        }*/
        //console.log("ORCH PROMPT", pr);
        const opts: ClientFeaturesOptions = { ...options };
        opts.model = state.orchestrator.model;
        opts.variables = {
            question: question,
            participants: ps.join(", "),
            advisors: ad.join((", ")),
            "advisors-names": Object.keys(state.advisors)
        };
        //console.log("ORCH VARS", opts.variables);
        if (state.orchestrator?.nothink) {
            if (!opts?.params) {
                opts.params = {}
            }
            opts.params.extra = { "chat_template_kwargs": { "enable_thinking": false } }
        }
        const payload: ClientFeaturesOptions = {
            ...opts,
        }
        console.log("ORCH OPTS", payload);
        await srv.executeAgentSync(pr, payload)
        scrollOutput();
        await route();
    }

    const answer = async (
        p: Participant,
        instructions?: string,
        isAdvisor?: boolean,
    ) => {
        let isAgent = false;
        let t = "debate-talk";
        if (isAdvisor) {
            t = "debate-advisor";
        } else {
            if (p?.tools?.includes("searchweb")) {
                isAgent = true;
                t = "debate-search"
            }
        }
        //console.log("ANS T", t);
        await srv.load(t, isAgent);
        state.talking = p;
        pushTurnToHistory({
            from: state.talking,
            content: "",
            state: {
                showThinking: false,
                showToolResponses: [],
                confirmRestartAtTurn: null,
                confirmToolCalls: {},
            }
        }, "answer");
        scrollOutput();
        const opts: ClientFeaturesOptions = {
            ...options,
            model: p.model,
        };
        const vars: Record<string, any> = {
            question: question,
            name: p.name,
            role: p.role,
        };
        //console.log(opts);
        opts.variables = vars;
        opts.debug = debug;
        //console.log("START ANSWER", opts);
        if (instructions) {
            opts.variables.instructions = instructions;
        } else {
            opts.variables.instructions = "nothing specific, continue the debate normaly";
        }
        const pr = state.history.length > 0 ? formatHistory() : "Start the conversation";
        /*console.log("---------------- AH ------------------");
        console.log(pr)
        console.log("--------------------------------------");*/
        /*console.log("H", state.history);
        console.log("ANS PART", p);
        console.log("ANS PROMPT", pr);*/
        //opts.nohistory = true;
        //initAwaiter();
        //console.log("EXEC", opts, "/", isAgent)
        if (p?.nothink) {
            if (!opts?.params) {
                opts.params = {}
            }
            opts.params.extra = { "chat_template_kwargs": { "enable_thinking": false } }
        }
        await srv.executeAgentSync(pr, opts);
        scrollOutput();
        //await awaiter;
    }

    const run = async (q: string, ii?: number) => {
        question = q;
        //Object.keys(o).forEach(k => options[k] = o[k]);
        //console.log("RUN", q);
        let i = ii ? ii : 0;
        continueDebate.value = true;
        while (continueDebate.value === true) {
            /*if (isPause.value === true) {
                await pauseAw.awaiter;
                console.log("RUN PAUSE");
                if (_isReset) {
                    return
                }
                console.log("END RUN PAUSE");
            }*/
            await orchestrate(i == 0 ? true : false);
            ++i;
            nTurn = i;
        }
        return { prompt: question };
    }

    const continueWithInput = async (txt: string) => {
        if (!isPause.value && continueDebate.value) {
            throw new Error(`can not continue: no pause or debate closed\npause: ${isPause.value}\ncontinue: ${continueDebate.value}`)
        }
        const turnState = {
            showThinking: false,
            showToolResponses: [],
            confirmRestartAtTurn: null,
            confirmToolCalls: {},
        };
        pushTurnToHistory({ from: "user", content: txt, state: turnState }, "continue");
        if (!continueDebate.value) {
            continueDebate.value = true;
        }
        if (isPause.value === true) {
            _isContinueWithInput = true;
            endPause();
            setTimeout(() => {
                _isContinueWithInput = false;
                scrollOutput()
            }, 100);
            //return
        }
        //await run("continue the debate considering the user input", options, nTurn)
    }

    const stop = async () => {
        await srv.cancel()
        continueDebate.value = false;
    }
    /*const initAwaiter = () => {
        const aw = createAwaiter();
        awaiter = aw.awaiter;
        unblock = aw.unblock;
    }*/

    const decodeOrchestratorMsg = (txt: string): OrchestratorMsg => {
        const action = extractBetweenTags(txt, "<action>", "</action>");
        let content: string | null = null;
        const to = new Array<string>();
        //console.log("DECODE", txt);
        if (txt.includes("<content>")) {
            content = extractBetweenTags(txt, "<content>", "</content>");
            // patch missing end tag
            if (content.includes("<content>")) {
                content = content.split("<content>")[1]
            }
        }
        if (txt.includes("<to>")) {
            let _totxt = extractBetweenTags(txt, "<to>", "</to>");
            // patch shity output
            _totxt.replaceAll("Avisor:", "").replaceAll("advisor:", "").trim();
            if (_totxt.includes(",")) {
                _totxt.split(",").forEach(t => to.push(t.trim()))
            } else {
                if (_totxt == "all") {
                    to.push(...Object.keys(state.participants))
                } else {
                    to.push(_totxt)
                }
            }
        }
        //console.log("END DECODE", action, content, to);
        return { action, content, to }
    }

    const pushTurnToHistory = (t: DebateHistoryTurn, from: string) => {
        //console.log("Push to history from", from, t);
        state.history.push(t);
    }

    const formatHistory = (): string => {
        const h = new Array<string>();
        state.history.forEach(t =>
            h.push(`**${t.from == 'user' ? t.from : t.from.id}**: ${t.content}`)
        )
        return h.join("\n\n")
    }

    const pause = () => {
        isPause.value = true;
    }

    const endPause = () => {
        isPause.value = false;
        pauseAw.unblock(true);
        pauseAw = createAwaiter<boolean>();
    }

    const reset = () => {
        state.history = [];
        state.talking = {} as Participant;
        stream.value = "";
        nodes.value = [];
        continueDebate.value = false;
        if (isPause.value) {
            _isReset = true;
            endPause();
            setTimeout(() => {
                _isReset = false;
            }, 100);
        }
    }

    return {
        state,
        stream,
        isPause,
        onReady,
        nodes,
        init,
        run,
        route,
        pause,
        endPause,
        continueWithInput,
        stop,
        configure,
        reset,
    }
};

export {
    useDebate
};
