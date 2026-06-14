import { reactive, ref, toRaw } from "vue";
import type { Debate } from "./interfaces.js";
import { api } from "./services/api.js";
import { defaultDebates } from "./conf.js";
import { createAwaiter } from "./utils.js";
import { useDebate } from "./debate.js";
import { AgentState } from "@agent-smith/types";
import { useStorage } from "@vueuse/core";

const debate = useDebate();
const debates = reactive<Record<string, Debate>>({});
const isReady = ref(false);
const openLiveThinking = useStorage("livethink", false);
const { awaiter, unblock } = createAwaiter<boolean>();
const onStateReady = awaiter;
const mainapp = reactive<{ state: AgentState }>({ state: {} as AgentState });

const currentDebate = reactive<{ debate: Debate, isActive: boolean, isEdit: boolean }>({
    debate: {} as Debate,
    isActive: false,
    isEdit: false,
});

async function initState(state: AgentState) {
    mainapp.state = state;
    console.log("STATE", state);
    const res = await api.get<Record<string, Debate>>("/app/debate/conf");
    if (!res.ok) {
        throw new Error(`can not get app config ${res.status} ${res.text}`)
    }
    let data: Record<string, Debate> = {};
    if (Object.keys(res.data).length == 0) {
        // no conf: set default
        const res2 = await api.post("/app/debate/update", toRaw(defaultDebates));
        if (!res2.ok) {
            throw new Error(`can not update app config ${res.status} ${res.text}`)
        }
        data = toRaw(defaultDebates);
    } else {
        data = res.data;
    }
    for (const [k, v] of Object.entries(data)) {
        debates[k] = v;
    }
    new URL(location.href).searchParams.get('d')
    const params = new URL(location.href).searchParams;
    const d = params.get('d');
    //console.log("D", d);
    if (d) {
        openDebate(d)
    };
    unblock(true);
}

function openDebate(id: string) {
    currentDebate.debate = debates[id];
    currentDebate.isActive = true;
    currentDebate.isEdit = false;
    debate.configure(currentDebate.debate);
    console.log("Debate", id, "opened", debate)
}

function closeDebate() {
    currentDebate.isActive = false;
}

function deleteDebate(d: Debate) {
    delete debates[d.id];
    currentDebate.isActive = false;
}

function addDebate(d: Debate) {
    debates[d.id] = d;
    currentDebate.isEdit = false;
}

export {
    debate,
    debates,
    isReady,
    currentDebate,
    onStateReady,
    mainapp,
    openLiveThinking,
    initState,
    openDebate,
    closeDebate,
    addDebate,
    deleteDebate,
}